import { defineStore } from 'pinia';
import type {
  GameState,
  CityId,
  DrugId,
  LogKind,
  LogSegment,
  MarketPrices,
  TradeResult,
} from 'types';
import { getCity } from 'data/cities';
import { getDrug, DRUGS } from 'data/drugs';
import { CONFIG } from 'data/config';
import {
  calculateMarket,
  applyTradeImpact,
  epochCrossed,
  isSupplyResetDay,
  emptySupply,
} from 'domain/pricing';
import { addLot, removeLots, heldQty, totalHeld } from 'domain/cargo';
import { money } from 'utils/format';
import { saveGame, loadGame, clearSave } from 'utils/storage';

export const LIMITS = {
  MAX_DAYS: CONFIG.MAX_DAYS,
  HEAT_MAX: CONFIG.HEAT_MAX,
} as const;

const HISTORY_LIMIT = 4;

const seg = (text: string, opts: Omit<LogSegment, 'text'> = {}): LogSegment => ({ text, ...opts });

function freshGame(seed: number): GameState {
  const city = getCity(CONFIG.START_CITY);

  const state: GameState = {
    seed,
    day: 1,
    cash: CONFIG.START_CASH,
    debt: CONFIG.START_DEBT,
    cityId: CONFIG.START_CITY,
    carId: 'walking',
    heat: 0,
    cargoLots: {},
    capacity: CONFIG.START_CAPACITY,
    log: [
      {
        day: 1,
        kind: 'info',
        segments: [
          seg('You step off the bus in '),
          seg(city.name, { bold: true }),
          seg(' with '),
          seg(money(CONFIG.START_CASH), { bold: true, color: 'gold-soft' }),
          seg('.'),
        ],
      },
      {
        day: 1,
        kind: 'bad',
        segments: [
          seg('The loan shark wants ', { color: 'wine-soft' }),
          seg(money(CONFIG.START_DEBT), { bold: true, color: 'wine-soft' }),
          seg(` back in ${CONFIG.MAX_DAYS} days.`, { color: 'wine-soft' }),
        ],
      },
    ],
    phase: 'survival',
    unlockedFeatures: { bank: false, profile: false },
    health: {
      current: CONFIG.START_HEALTH_MAX,
      max: CONFIG.START_HEALTH_MAX,
    },
    supply: emptySupply(),
    market: null,
    marketHistory: {},
  };

  state.market = calculateMarket(city, state.day, state.seed, state.supply);
  state.marketHistory = recordInitialHistory(state.cityId, state.market, state.day);
  return state;
}

function recordInitialHistory(
  cityId: CityId,
  market: MarketPrices,
  day: number,
): GameState['marketHistory'] {
  const cityHistory: Partial<Record<DrugId, { day: number; epoch: number; price: number }[]>> = {};
  for (const drug of DRUGS) {
    cityHistory[drug.id] = [{ day, epoch: market.epoch, price: market.prices[drug.id] }];
  }
  return { [cityId]: cityHistory };
}

function restoreOrFresh(): GameState {
  const saved = loadGame();
  if (!saved) return freshGame(Date.now() >>> 0);

  const city = getCity(saved.cityId);
  saved.market = calculateMarket(city, saved.day, saved.seed, saved.supply);
  saved.marketHistory = saved.marketHistory ?? {};
  saved.cargoLots = saved.cargoLots ?? {};
  return saved;
}

export const useGameStore = defineStore('game', {
  state: (): GameState => restoreOrFresh(),

  getters: {
    city: (s) => getCity(s.cityId),

    cargoUsed: (s) => totalHeld(s.cargoLots),

    /** Units held for a specific drug, summed across lots. */
    heldQty: (s) => (drugId: DrugId) => heldQty(s.cargoLots, drugId),
  },

  actions: {
    persist() {
      saveGame(this.$state);
    },

    addLog(kind: LogKind, segments: LogSegment[] | string) {
      const segs = typeof segments === 'string' ? [seg(segments)] : segments;
      this.log.push({ day: this.day, kind, segments: segs });
    },

    // ---------------------------------------------------------- market --
    refreshMarket() {
      const city = getCity(this.cityId);
      const newMarket = calculateMarket(city, this.day, this.seed, this.supply);
      this.market = newMarket;
      this.recordPricePoints(city.id, newMarket);
    },

    recordPricePoints(cityId: CityId, market: MarketPrices) {
      const existing = this.marketHistory[cityId] ?? {};
      const updated: typeof existing = { ...existing };

      for (const drug of DRUGS) {
        const price = market.prices[drug.id];
        const points = existing[drug.id] ?? [];
        const last = points[points.length - 1];

        if (!last || last.price !== price) {
          updated[drug.id] = [...points, { day: this.day, epoch: market.epoch, price }].slice(
            -HISTORY_LIMIT,
          );
        }
      }

      this.marketHistory = { ...this.marketHistory, [cityId]: updated };
    },

    // ----------------------------------------------------------- trade --
    buy(drugId: DrugId, qty: number): TradeResult {
      if (qty <= 0) return { ok: false, reason: 'Quantity must be positive.' };
      if (!this.market) return { ok: false, reason: 'Market not ready.' };

      const drug = getDrug(drugId);
      const price = this.market.prices[drugId];
      const total = price * qty;

      if (total > this.cash)
        return { ok: false, reason: `Not enough cash (need ${money(total)}).` };

      const free = this.capacity - this.cargoUsed;
      if (qty > free) return { ok: false, reason: `Not enough space (${free} free).` };

      this.cash -= total;
      this.cargoLots = addLot(this.cargoLots, drugId, qty, price, this.day);
      this.supply = applyTradeImpact(this.supply, this.cityId, drugId, qty, 'buy');

      this.addLog('info', [
        seg('Bought '),
        seg(`${qty}g ${drug.name}`, { bold: true }),
        seg(' for '),
        seg(money(total), { bold: true }),
      ]);

      this.refreshMarket();
      this.persist();
      return { ok: true };
    },

    sell(drugId: DrugId, qty: number): TradeResult {
      if (qty <= 0) return { ok: false, reason: 'Quantity must be positive.' };
      if (!this.market) return { ok: false, reason: 'Market not ready.' };

      const held = this.heldQty(drugId);
      if (qty > held) return { ok: false, reason: `You only hold ${held}g.` };

      const drug = getDrug(drugId);
      const price = this.market.prices[drugId];
      const revenue = price * qty;

      const result = removeLots(this.cargoLots, drugId, qty);
      const profit = revenue - result.costRemoved;

      this.cash += revenue;
      this.cargoLots = result.lots;
      this.supply = applyTradeImpact(this.supply, this.cityId, drugId, qty, 'sell');

      const segments: LogSegment[] = [
        seg('Sold '),
        seg(`${qty}g ${drug.name}`, { bold: true }),
        seg(' for '),
        seg(money(revenue), { bold: true }),
      ];

      if (Math.abs(profit) >= 1) {
        segments.push(seg(' · '));
        if (profit >= 0) {
          segments.push(seg(`Profit ${money(profit)}`, { color: 'forest-soft' }));
        } else {
          segments.push(seg(`Loss ${money(-profit)}`, { color: 'wine-soft' }));
        }
      }

      this.addLog(profit >= 0 ? 'good' : 'bad', segments);
      this.refreshMarket();
      this.persist();
      return { ok: true };
    },

    // ------------------------------------------------------------ time --
    advanceDay(n = 1) {
      for (let i = 0; i < n; i++) {
        const previousDay = this.day;
        this.day += 1;

        if (isSupplyResetDay(this.day)) {
          this.supply = emptySupply();
          this.addLog('info', 'The market stabilizes — supply returns to normal.');
        }

        if (epochCrossed(previousDay, this.day) && this.market) {
          const city = getCity(this.cityId);
          const newMarket = calculateMarket(city, this.day, this.seed, this.supply);
          this.logEpochMovers(this.market, newMarket);
          this.market = newMarket;
        }
      }

      this.refreshMarket();
      this.persist();
    },

    logEpochMovers(prev: MarketPrices, next: MarketPrices) {
      const risers: { name: string; delta: number }[] = [];
      const fallers: { name: string; delta: number }[] = [];

      for (const drug of DRUGS) {
        const delta = next.prices[drug.id] - prev.prices[drug.id];
        if (delta > 0) risers.push({ name: drug.name, delta });
        else if (delta < 0) fallers.push({ name: drug.name, delta: -delta });
      }

      risers.sort((a, b) => b.delta - a.delta);
      fallers.sort((a, b) => b.delta - a.delta);

      if (!risers.length && !fallers.length) {
        this.addLog('info', 'Prices hold steady.');
        return;
      }

      const segments: LogSegment[] = [seg('Prices shift — ')];

      risers.slice(0, 3).forEach((r, i) => {
        if (i > 0) segments.push(seg(', '));
        segments.push(seg(`↑ ${r.name} +$${r.delta}`, { color: 'wine-soft' }));
      });

      if (risers.length && fallers.length) segments.push(seg('   '));

      fallers.slice(0, 3).forEach((f, i) => {
        if (i > 0) segments.push(seg(', '));
        segments.push(seg(`↓ ${f.name} −$${f.delta}`, { color: 'forest-soft' }));
      });

      this.addLog('info', segments);
    },

    // ----------------------------------------------------------- debug --
    debugAddMoney(amount: number) {
      this.cash += amount;
      this.addLog('good', [
        seg('[DEBUG] '),
        seg(money(amount), { bold: true, color: 'gold-soft' }),
        seg(' added.'),
      ]);
      this.persist();
    },

    // ----------------------------------------------------------- reset --
    reset() {
      clearSave();
      Object.assign(this, freshGame(Date.now() >>> 0));
      this.persist();
    },
  },
});
