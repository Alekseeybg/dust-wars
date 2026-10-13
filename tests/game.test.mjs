import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { createPinia, setActivePinia } from 'pinia';
import { useGameStore } from 'stores/game';
import { CONFIG } from 'data/config';

const saved = new Map();
globalThis.localStorage = {
  getItem: (key) => saved.get(key) ?? null,
  setItem: (key, value) => saved.set(key, value),
  removeItem: (key) => saved.delete(key),
};

beforeEach(() => {
  saved.clear();
  setActivePinia(createPinia());
});

function gameWithSeed() {
  const game = useGameStore();
  game.seed = 12345;
  game.refreshMarket();
  return game;
}

test('a new game starts with the configured balances, market and history', () => {
  const game = gameWithSeed();
  assert.equal(game.cash, CONFIG.START_CASH);
  assert.equal(game.debt, CONFIG.START_DEBT);
  assert.equal(game.cityId, CONFIG.START_CITY);
  assert.equal(game.day, 1);
  assert.equal(game.cargoUsed, 0);
  assert.equal(game.market.cityId, game.cityId);
});

test('buy and sell update cash, FIFO cargo, pressure, log and persisted state together', () => {
  const game = gameWithSeed();
  const purchasePrice = game.market.prices.weed;
  assert.deepEqual(game.buy('weed', 20), { ok: true });
  assert.equal(game.cash, CONFIG.START_CASH - purchasePrice * 20);
  assert.equal(game.heldQty('weed'), 20);
  assert.equal(game.supply.brooklyn.weed, 0.99);
  const salePrice = game.market.prices.weed;
  assert.deepEqual(game.sell('weed', 5), { ok: true });
  assert.equal(game.cash, CONFIG.START_CASH - purchasePrice * 20 + salePrice * 5);
  assert.equal(game.heldQty('weed'), 15);
  const persisted = JSON.parse(saved.get('dust-wars:save'));
  assert.equal(persisted.version, 3);
  assert.deepEqual(persisted.state, JSON.parse(JSON.stringify(game.$state)));
});

test('rejected trades leave game state and storage untouched', () => {
  const game = gameWithSeed();
  const initial = JSON.stringify(game.$state);
  assert.equal(game.buy('weed', 0).ok, false);
  assert.equal(game.buy('weed', game.capacity + 1).ok, false);
  assert.equal(game.buy('heroin', 100000).ok, false);
  assert.equal(game.sell('weed', 1).ok, false);
  assert.equal(JSON.stringify(game.$state), initial);
  assert.equal(saved.size, 0);
});

test('selling the entire holding deletes its cargo entry', () => {
  const game = gameWithSeed();
  game.buy('weed', 20);
  game.sell('weed', 20);
  assert.deepEqual(game.cargoLots, {});
  assert.equal(game.cargoUsed, 0);
});

test('day advancement records epoch movements and bounds market history', () => {
  const game = gameWithSeed();
  const prices = { ...game.market.prices };
  game.advanceDay(2);
  assert.equal(game.day, 3);
  assert.deepEqual(game.market.prices, prices);
  game.advanceDay();
  assert.equal(game.market.epoch, 1);
  assert.equal(game.log.at(-1).segments[0].text, 'Prices shift — ');
  for (let i = 0; i < 10; i++) game.advanceDay(3);
  for (const points of Object.values(game.marketHistory.brooklyn)) assert.ok(points.length <= 4);
});

test('version 3 saves restore and recalculated markets match the live run', () => {
  const game = gameWithSeed();
  game.buy('weed', 10);
  game.advanceDay(3);
  const snapshot = JSON.parse(JSON.stringify(game.$state));
  setActivePinia(createPinia());
  assert.deepEqual(JSON.parse(JSON.stringify(useGameStore().$state)), snapshot);
});

test('reset replaces the entire run and persists a fresh save', () => {
  const game = gameWithSeed();
  game.buy('weed', 10);
  game.advanceDay(3);
  game.reset();
  assert.equal(game.day, 1);
  assert.equal(game.cash, CONFIG.START_CASH);
  assert.deepEqual(game.cargoLots, {});
  assert.equal(game.log.length, 2);
  assert.equal(JSON.parse(saved.get('dust-wars:save')).state.day, 1);
});
