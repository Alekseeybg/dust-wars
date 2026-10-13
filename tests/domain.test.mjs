import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addLot, removeLots, heldQty, totalHeld } from 'domain/cargo';
import { getCity } from 'data/cities';
import { getDrug } from 'data/drugs';
import {
  calculateMarket,
  calculatePrice,
  currentEpoch,
  epochCrossed,
  applyTradeImpact,
  supplyAt,
  supplyPressure,
} from 'domain/pricing';

test('purchases merge only adjacent lots with matching day and price without mutating inputs', () => {
  const original = { weed: [{ qty: 10, price: 12, day: 1 }] };
  const merged = addLot(original, 'weed', 5, 12, 1);
  assert.deepEqual(merged.weed, [{ qty: 15, price: 12, day: 1 }]);
  const nextDay = addLot(merged, 'weed', 3, 12, 2);
  assert.equal(nextDay.weed.length, 2);
  assert.equal(heldQty(nextDay, 'weed'), 18);
  assert.equal(totalHeld(addLot(nextDay, 'coke', 2, 90, 2)), 20);
  assert.deepEqual(original, { weed: [{ qty: 10, price: 12, day: 1 }] });
});

test('FIFO sales preserve remaining batches and account for the actual purchase cost', () => {
  const original = {
    weed: [
      { qty: 10, price: 12, day: 1 },
      { qty: 5, price: 20, day: 2 },
    ],
  };
  const partial = removeLots(original, 'weed', 12);
  assert.equal(partial.costRemoved, 160);
  assert.deepEqual(partial.lots.weed, [{ qty: 3, price: 20, day: 2 }]);
  assert.deepEqual(removeLots(partial.lots, 'weed', 3), { lots: {}, costRemoved: 60 });
  assert.equal(original.weed[0].qty, 10);
});

test('prices stay deterministic within an epoch and trends compare consecutive epochs', () => {
  const city = getCity('brooklyn');
  const first = calculateMarket(city, 1, 12345, {});
  assert.deepEqual(first.prices, {
    weed: 12,
    hash: 23,
    speed: 15,
    shrooms: 25,
    acid: 35,
    oxy: 35,
    opium: 60,
    coke: 95,
    heroin: 167,
    fentanyl: 109,
  });
  assert.deepEqual(calculateMarket(city, 3, 12345, {}), first);
  assert.equal(currentEpoch(4), 1);
  assert.equal(epochCrossed(2, 3), false);
  assert.equal(epochCrossed(3, 4), true);
  const next = calculateMarket(city, 4, 12345, {});
  for (const id of Object.keys(first.prices)) {
    const delta = next.prices[id] - first.prices[id];
    assert.equal(next.trends[id], delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat');
    assert.equal(first.trends[id], 'flat');
  }
  assert.equal(calculatePrice(getDrug('weed'), city, 1, 12345, 0.5), 25);
});

test('trade pressure is immutable, city-specific and clamped at supply bounds', () => {
  const original = {};
  const bought = applyTradeImpact(original, 'brooklyn', 'weed', 200, 'buy');
  assert.equal(supplyAt(bought, 'brooklyn', 'weed'), 0.9);
  assert.equal(supplyAt(bought, 'queens', 'weed'), 1);
  assert.equal(
    supplyAt(applyTradeImpact(bought, 'brooklyn', 'weed', 10000, 'buy'), 'brooklyn', 'weed'),
    0.5,
  );
  assert.equal(
    supplyAt(applyTradeImpact(bought, 'brooklyn', 'weed', 10000, 'sell'), 'brooklyn', 'weed'),
    2,
  );
  assert.deepEqual(supplyPressure(1), { amount: 0, kind: 'neutral' });
  assert.deepEqual(supplyPressure(0.5), { amount: 1, kind: 'scarce' });
  assert.deepEqual(supplyPressure(2), { amount: 1, kind: 'glutted' });
  assert.deepEqual(original, {});
});
