import type { MarketHistory, MarketPrices } from 'types';
import { DRUGS } from 'data/drugs';
import { CONFIG } from 'data/config';

/** Record changed prices only, preserving the most recent points per drug. */
export function recordPricePoints(
  history: MarketHistory,
  market: MarketPrices,
  day: number,
): MarketHistory {
  const existing = history[market.cityId] ?? {};
  const updated = { ...existing };

  for (const drug of DRUGS) {
    const price = market.prices[drug.id];
    const points = existing[drug.id] ?? [];
    const last = points.at(-1);

    if (!last || last.price !== price) {
      updated[drug.id] = [...points, { day, epoch: market.epoch, price }].slice(
        -CONFIG.PRICE_HISTORY_LIMIT,
      );
    }
  }

  return { ...history, [market.cityId]: updated };
}
