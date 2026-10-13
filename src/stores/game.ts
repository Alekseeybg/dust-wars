import { defineStore } from 'pinia';
import type { GameState, DrugId, LogKind, TradeResult } from 'types';
import { getCity } from 'data/cities';
import { getDrug } from 'data/drugs';
import { CONFIG } from 'data/config';
import {
  calculateMarket,
  applyTradeImpact,
  epochCrossed,
  isSupplyResetDay,
  emptySupply,
} from 'domain/pricing';
import { money } from 'utils/format';

export const LIMITS = {
  MAX_DAYS: CONFIG.MAX_DAYS,
  HEAT_MAX: CONFIG.HEAT_MAX,
} as const;

/** Build the initial game state for a fresh run. */
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
    cargo: {},
    capacity: CONFIG.START_CAPACITY,
    log: [
      {
        day: 1,
        kind: 'info',
        text: `You step off the bus in ${city.name} with ${money(CONFIG.START_CASH)}.`,
      },
      {
        day: 1,
        kind: 'bad',
        text: `The loan shark wants ${money(CONFIG.START_DEBT)} back in ${CONFIG.MAX_DAYS} days.`,
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
  };

  state.market = calculateMarket(city, state.day, state.seed, state.supply);
  return state;
}

export const useGameStore = defineStore('game', {
  state: (): GameState => freshGame(Date.now() >>> 0),

  getters: {
    city: (s) => getCity(s.cityId),
    cargoUsed: (s) => Object.values(s.cargo).reduce<number>((sum, qty) => sum + (qty ?? 0), 0),
  },

  actions: {
    // ---------------------------------------------------------------- log --
    addLog(kind: LogKind, text: string) {
      this.log.push({ day: this.day, kind, text });
    },

    // ------------------------------------------------------------- market --
    /**
     * Recompute the market snapshot from current state. Must be called
     * after anything that affects price: trading, travel, day advance.
     */
    refreshMarket() {
      const city = getCity(this.cityId);
      this.market = calculateMarket(city, this.day, this.seed, this.supply);
    },

    // -------------------------------------------------------------- trade --
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
      this.cargo[drugId] = (this.cargo[drugId] ?? 0) + qty;
      this.supply = applyTradeImpact(this.supply, this.cityId, drugId, qty, 'buy');

      this.addLog('info', `Bought ${qty}g ${drug.name} in ${this.city.name} for ${money(total)}.`);

      this.refreshMarket();
      return { ok: true };
    },

    sell(drugId: DrugId, qty: number): TradeResult {
      if (qty <= 0) return { ok: false, reason: 'Quantity must be positive.' };
      if (!this.market) return { ok: false, reason: 'Market not ready.' };

      const held = this.cargo[drugId] ?? 0;
      if (qty > held) return { ok: false, reason: `You only hold ${held}g.` };

      const drug = getDrug(drugId);
      const price = this.market.prices[drugId];
      const total = price * qty;

      this.cash += total;
      const remaining = held - qty;
      if (remaining > 0) this.cargo[drugId] = remaining;
      else delete this.cargo[drugId];

      this.supply = applyTradeImpact(this.supply, this.cityId, drugId, qty, 'sell');

      this.addLog('good', `Sold ${qty}g ${drug.name} in ${this.city.name} for ${money(total)}.`);

      this.refreshMarket();
      return { ok: true };
    },

    // --------------------------------------------------------------- time --
    /**
     * Advance the calendar. Handles epoch crossings (price reroll) and
     * market resets (supply returns to neutral) as side effects, logging
     * each so the player learns the rhythm.
     */
    advanceDay(n = 1) {
      for (let i = 0; i < n; i++) {
        const previousDay = this.day;
        this.day += 1;

        if (epochCrossed(previousDay, this.day)) {
          this.addLog('info', 'Prices shift across the city.');
        }

        if (isSupplyResetDay(this.day)) {
          this.supply = emptySupply();
          this.addLog('info', 'The market stabilizes — supply returns to normal.');
        }
      }

      this.refreshMarket();
    },

    // -------------------------------------------------------------- reset --
    reset() {
      Object.assign(this, freshGame(Date.now() >>> 0));
    },
  },
});
