import { defineStore } from 'pinia';
import type {
  GameState,
  DrugId,
  LogCategory,
  LogKind,
  LogSegment,
  TradeResult,
  TradeDirection,
} from 'types';
import { getCity } from 'data/cities';
import { calculateMarket, epochCrossed, isSupplyResetDay, emptySupply } from 'domain/pricing';
import { heldQty, totalHeld, groupCargo } from 'domain/cargo';
import { money } from 'utils/format';
import { saveGame, loadGame, clearSave } from 'src/services/gameStorage';
import { createGame } from 'domain/game';
import { prepareTrade } from 'domain/trading';
import { recordPricePoints } from 'domain/history';
import { logSegment, epochMovementSegments } from 'domain/log';

function restoreOrFresh(): GameState {
  const saved = loadGame();
  if (!saved) return createGame(Date.now() >>> 0);

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

    freeCapacity: (s) => s.capacity - totalHeld(s.cargoLots),

    cargoGroups: (s) => groupCargo(s.cargoLots),

    /** Units held for a specific drug, summed across lots. */
    heldQty: (s) => (drugId: DrugId) => heldQty(s.cargoLots, drugId),
  },

  actions: {
    persist() {
      saveGame(this.$state);
    },

    addLog(kind: LogKind, segments: LogSegment[] | string, category: LogCategory = 'event') {
      const segs = typeof segments === 'string' ? [logSegment(segments)] : segments;
      this.log.push({ day: this.day, kind, category, segments: segs });
    },

    // ---------------------------------------------------------- market --
    refreshMarket() {
      const city = getCity(this.cityId);
      const newMarket = calculateMarket(city, this.day, this.seed, this.supply);
      this.market = newMarket;
      this.marketHistory = recordPricePoints(this.marketHistory, newMarket, this.day);
    },

    // ----------------------------------------------------------- trade --
    buy(drugId: DrugId, qty: number): TradeResult {
      return this.executeTrade('buy', drugId, qty);
    },

    sell(drugId: DrugId, qty: number): TradeResult {
      return this.executeTrade('sell', drugId, qty);
    },

    executeTrade(direction: TradeDirection, drugId: DrugId, qty: number): TradeResult {
      const plan = prepareTrade(this.$state, direction, drugId, qty);
      if (!plan.ok) return plan;

      this.$patch((state) => {
        state.cash = plan.update.cash;
        state.cargoLots = plan.update.cargoLots;
        state.supply = plan.update.supply;
      });
      this.addLog(plan.log.kind, plan.log.segments, 'trade');
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
          this.addLog('info', epochMovementSegments(this.market, newMarket));
          this.market = newMarket;
        }
      }

      this.refreshMarket();
      this.persist();
    },

    // ----------------------------------------------------------- debug --
    debugAddMoney(amount: number) {
      this.cash += amount;
      this.addLog('good', [
        logSegment('[DEBUG] '),
        logSegment(money(amount), { bold: true, color: 'gold-soft' }),
        logSegment(' added.'),
      ]);
      this.persist();
    },

    // ----------------------------------------------------------- reset --
    reset() {
      clearSave();
      this.$state = createGame(Date.now() >>> 0);
      this.persist();
    },
  },
});
