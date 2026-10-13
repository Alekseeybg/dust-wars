import type { GameState, DrugId, TradeDirection, TradeResult, LogKind, LogSegment } from 'types';
import { getDrug } from 'data/drugs';
import { addLot, removeLots, heldQty, totalHeld } from './cargo';
import { applyTradeImpact } from './pricing';
import { logSegment } from './log';
import { money } from 'utils/format';

type TradePlan =
  | {
      ok: true;
      update: Pick<GameState, 'cash' | 'cargoLots' | 'supply'>;
      log: { kind: LogKind; segments: LogSegment[] };
    }
  | Extract<TradeResult, { ok: false }>;

/** Validate and calculate a trade without changing state or performing IO. */
export function prepareTrade(
  state: GameState,
  direction: TradeDirection,
  drugId: DrugId,
  qty: number,
): TradePlan {
  if (qty <= 0) return { ok: false, reason: 'Quantity must be positive.' };
  if (!state.market) return { ok: false, reason: 'Market not ready.' };

  const price = state.market.prices[drugId];
  const total = price * qty;
  let cargoLots: GameState['cargoLots'];
  let profit = 0;

  if (direction === 'buy') {
    if (total > state.cash) {
      return { ok: false, reason: `Not enough cash (need ${money(total)}).` };
    }
    const free = state.capacity - totalHeld(state.cargoLots);
    if (qty > free) return { ok: false, reason: `Not enough space (${free} free).` };
    cargoLots = addLot(state.cargoLots, drugId, qty, price, state.day);
  } else {
    const held = heldQty(state.cargoLots, drugId);
    if (qty > held) return { ok: false, reason: `You only hold ${held}g.` };
    const result = removeLots(state.cargoLots, drugId, qty);
    cargoLots = result.lots;
    profit = total - result.costRemoved;
  }

  const segments = tradeSegments(direction, drugId, qty, total, profit);
  return {
    ok: true,
    update: {
      cash: direction === 'buy' ? state.cash - total : state.cash + total,
      cargoLots,
      supply: applyTradeImpact(state.supply, state.cityId, drugId, qty, direction),
    },
    log: { kind: direction === 'buy' ? 'info' : profit >= 0 ? 'good' : 'bad', segments },
  };
}

function tradeSegments(
  direction: TradeDirection,
  drugId: DrugId,
  qty: number,
  total: number,
  profit: number,
): LogSegment[] {
  const drug = getDrug(drugId);
  const segments = [
    logSegment(direction === 'buy' ? 'Bought ' : 'Sold '),
    logSegment(`${qty}g ${drug.name}`, { bold: true }),
    logSegment(' for '),
    logSegment(money(total), { bold: true }),
  ];
  if (direction === 'sell' && Math.abs(profit) >= 1) {
    segments.push(logSegment(' · '));
    segments.push(
      profit >= 0
        ? logSegment(`Profit ${money(profit)}`, { color: 'forest-soft' })
        : logSegment(`Loss ${money(-profit)}`, { color: 'wine-soft' }),
    );
  }
  return segments;
}
