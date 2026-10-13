/**
 * Pricing domain — pure functions for computing drug prices and
 * manipulating market supply.
 *
 * No Vue, no Pinia, no DOM. Everything here is deterministic given
 * its inputs, which means prices can be reproduced exactly from a
 * save file (seed + epoch + city + drug + supply).
 */
import type { City, CityId, Drug, DrugId, MarketPrices, PriceTrend, SupplyState } from 'types';
import { DRUGS } from 'data/drugs';
import { CONFIG } from 'data/config';
import { makeRng } from 'utils/rng';

// -----------------------------------------------------------------------------
// Epochs
// -----------------------------------------------------------------------------

/** Days map to epochs; days 1..N are epoch 0, days N+1..2N are epoch 1, etc. */
export function currentEpoch(day: number): number {
  return Math.floor((day - 1) / CONFIG.PRICE_CYCLE_DAYS);
}

/** True when the two days fall in different price epochs. */
export function epochCrossed(prevDay: number, newDay: number): boolean {
  return currentEpoch(prevDay) !== currentEpoch(newDay);
}

/** True when this day is a market-reset epoch (supply returns to neutral). */
export function isSupplyResetDay(day: number): boolean {
  const epoch = currentEpoch(day);
  return epoch > 0 && epoch % CONFIG.SUPPLY_RESET_EPOCHS === 0;
}

// -----------------------------------------------------------------------------
// Supply
// -----------------------------------------------------------------------------

/**
 * Supply for a specific (city, drug). Missing entries mean neutral (1.0),
 * so callers never have to distinguish "unset" from "explicitly 1.0".
 */
export function supplyAt(supply: SupplyState, cityId: CityId, drugId: DrugId): number {
  return supply[cityId]?.[drugId] ?? 1.0;
}

/**
 * Apply the market pressure of a trade. Buying removes stock (price up),
 * selling adds stock (price down). Result is clamped to CONFIG.SUPPLY_MIN/MAX.
 *
 * Returns a new SupplyState — the input is never mutated.
 */
export function applyTradeImpact(
  supply: SupplyState,
  cityId: CityId,
  drugId: DrugId,
  qty: number,
  direction: 'buy' | 'sell',
): SupplyState {
  const citySupply = { ...(supply[cityId] ?? {}) };
  const current = citySupply[drugId] ?? 1.0;
  const delta = qty * CONFIG.SUPPLY_IMPACT_PER_GRAM;
  const next = direction === 'buy' ? current - delta : current + delta;

  citySupply[drugId] = clamp(next, CONFIG.SUPPLY_MIN, CONFIG.SUPPLY_MAX);
  return { ...supply, [cityId]: citySupply };
}

/**
 * Normalized distance from neutral supply, for the UI to render the
 * pressure pip row. Amount is 0..1; kind is 'scarce' (player has been
 * buying here, price up), 'glutted' (player has been selling, price
 * down), or 'neutral'.
 */
export function supplyPressure(supply: number): {
  amount: number;
  kind: 'neutral' | 'scarce' | 'glutted';
} {
  if (supply > 1.0) {
    const amount = (supply - 1.0) / (CONFIG.SUPPLY_MAX - 1.0);
    return { amount: Math.min(1, amount), kind: 'glutted' };
  }
  if (supply < 1.0) {
    const amount = (1.0 - supply) / (1.0 - CONFIG.SUPPLY_MIN);
    return { amount: Math.min(1, amount), kind: 'scarce' };
  }
  return { amount: 0, kind: 'neutral' };
}

/** Fresh supply state — everything neutral. */
export function emptySupply(): SupplyState {
  return {};
}

// -----------------------------------------------------------------------------
// Pricing
// -----------------------------------------------------------------------------

/**
 * FNV-1a 32-bit hash. Combines the identifying parts (seed, epoch, city,
 * drug) into one 32-bit value so each drug's price is independent of the
 * others and independent of iteration order.
 *
 * That last property matters: if we seeded the RNG once per city-epoch
 * and drew prices in a loop, adding a new drug to DRUGS would shift
 * every subsequent drug's price. Hashing per (city, epoch, drug) keeps
 * each price self-contained.
 */
function hashSeed(...parts: (string | number)[]): number {
  let h = 0x811c9dc5;
  for (const part of parts) {
    const s = String(part);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
  }
  return h >>> 0;
}

/**
 * Price of a single drug in a single city for the epoch containing `day`.
 *
 *   price = (base * cityDemand * jitter) / supply
 *
 * cityDemand comes from the city's demand map (< 1 = cheap here, good
 * place to buy; > 1 = expensive here, good place to sell). jitter is
 * uniform in [1 - vol, 1 + vol], so a drug with vol = .20 can swing
 * ±20% around its mean for that city. supply scales the result: 0.5
 * doubles the price, 2.0 halves it.
 *
 * Result is clamped to a minimum of $1 and rounded to an integer.
 */
export function calculatePrice(
  drug: Drug,
  city: City,
  day: number,
  seed: number,
  supply = 1.0,
): number {
  const epoch = currentEpoch(day);
  const rng = makeRng(hashSeed(seed, epoch, city.id, drug.id));
  const demand = city.demand[drug.id] ?? 1;
  const jitter = 1 + (rng() * 2 - 1) * drug.vol;
  const raw = (drug.base * demand * jitter) / supply;
  return Math.max(1, Math.round(raw));
}

/**
 * Full market snapshot for a city on the epoch containing `day`, with
 * a trend arrow per drug (this epoch vs previous epoch, same supply).
 *
 * The trend compares epochs, not days — so it stays stable across the
 * 3 days of an epoch and only shifts at the boundary. Intra-epoch price
 * changes come from supply and are surfaced separately as pressure.
 */
export function calculateMarket(
  city: City,
  day: number,
  seed: number,
  supply: SupplyState,
): MarketPrices {
  const epoch = currentEpoch(day);
  const prices = {} as Record<DrugId, number>;
  const trends = {} as Record<DrugId, PriceTrend>;

  for (const drug of DRUGS) {
    const s = supplyAt(supply, city.id, drug.id);
    prices[drug.id] = calculatePrice(drug, city, day, seed, s);
    trends[drug.id] = priceTrend(drug, city, day, seed, s);
  }

  return { cityId: city.id, epoch, prices, trends };
}

/**
 * Compare this epoch's price against the previous epoch's, holding supply
 * constant so the arrow reflects pure market movement. Returns 'flat' for
 * epoch 0, when there is no previous epoch to compare against.
 */
export function priceTrend(
  drug: Drug,
  city: City,
  day: number,
  seed: number,
  supply = 1.0,
): PriceTrend {
  const epoch = currentEpoch(day);
  if (epoch === 0) return 'flat';

  const today = calculatePrice(drug, city, day, seed, supply);
  const prevEpochDay = (epoch - 1) * CONFIG.PRICE_CYCLE_DAYS + 1;
  const yesterday = calculatePrice(drug, city, prevEpochDay, seed, supply);

  if (today > yesterday) return 'up';
  if (today < yesterday) return 'down';
  return 'flat';
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
