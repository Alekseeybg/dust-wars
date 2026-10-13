<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { Notify } from 'quasar';
import { useGameStore } from 'stores/game';
import { DRUGS } from 'data/drugs';
import { supplyAt, supplyPressure } from 'domain/pricing';
import type { DrugId, PricePoint } from 'types';
import Panel from 'components/Panel.vue';
import StreetLog from 'components/StreetLog.vue';
import DrugRow from 'components/market/DrugRow.vue';
import type { MarketRow } from 'components/market/types';

type MarketSort = 'rarity' | 'name' | 'price';
type SortDirection = 'asc' | 'desc';

const game = useGameStore();
const { market, supply, city, cash, freeCapacity } = storeToRefs(game);
const sortBy = ref<MarketSort>('rarity');
const sortDirection = ref<SortDirection>('asc');
const tierRank = { common: 0, uncommon: 1, rare: 2 } as const;

/** Bumping this causes every row to reset its local quantities to 1. */
const resetSignal = ref(0);
function resetAllQuantities() {
  resetSignal.value += 1;
}

const rows = computed<MarketRow[]>(() => {
  const snapshot = market.value;
  if (!snapshot) return [];
  const marketRows = DRUGS.map((drug, index) => {
    const supplyLevel = supplyAt(supply.value, game.cityId, drug.id);
    return {
      drug,
      price: snapshot.prices[drug.id],
      trend: snapshot.trends[drug.id],
      held: game.heldQty(drug.id),
      pressure: supplyPressure(supplyLevel),
      defaultOrder: index,
    };
  });

  return marketRows.sort((left, right) => {
    const direction = sortDirection.value === 'asc' ? 1 : -1;
    const comparison =
      sortBy.value === 'name'
        ? left.drug.name.localeCompare(right.drug.name)
        : sortBy.value === 'price'
          ? left.price - right.price
          : tierRank[left.drug.tier] - tierRank[right.drug.tier];

    return comparison === 0 ? left.defaultOrder - right.defaultOrder : comparison * direction;
  });
});

function setSort(nextSort: MarketSort) {
  if (sortBy.value === nextSort) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    return;
  }

  sortBy.value = nextSort;
  sortDirection.value = 'asc';
}

function sortAriaState(sort: MarketSort) {
  if (sortBy.value !== sort) return undefined;
  return sortDirection.value === 'asc' ? 'ascending' : 'descending';
}

function historyFor(drugId: DrugId): PricePoint[] {
  return game.marketHistory[game.cityId]?.[drugId] ?? [];
}

function maxBuyFor(price: number): number {
  const byCash = Math.floor(cash.value / price);
  return Math.max(0, Math.min(byCash, freeCapacity.value));
}

function trade(direction: 'buy' | 'sell', drugId: DrugId, qty: number) {
  const result = game[direction](drugId, qty);
  if (!result.ok) Notify.create({ type: 'negative', message: result.reason });
}
</script>

<template>
  <div class="market-page">
    <Panel class="market-panel" title="Market" :subtitle="city.name">
      <template #header>
        <div class="market-panel__heading">
          <h2 class="market-panel__title">Market</h2>
          <span class="market-panel__location">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M12.5 6.5c0 3.1-4.5 7-4.5 7s-4.5-3.9-4.5-7a4.5 4.5 0 0 1 9 0Z" />
              <circle cx="8" cy="6.5" r="1.5" />
            </svg>
            {{ city.name }}
          </span>
        </div>

        <button
          class="market-panel__reset"
          type="button"
          aria-label="Reset all quantities"
          title="Reset all quantities"
          @click="resetAllQuantities"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M13 6.5A5.25 5.25 0 1 0 13.1 10M13 2.75v3.9H9.1" />
          </svg>
          <span>Reset qty</span>
        </button>
      </template>

      <div v-if="!market" class="empty">Market data unavailable.</div>

      <div v-else class="drugs">
        <div class="drugs__sort-bar" aria-label="Market sorting">
          <span class="drugs__sort-label">Sort by</span>
          <button
            v-for="sort in ['rarity', 'name', 'price'] as const"
            :key="sort"
            class="drugs__sort-button"
            :class="{ 'is-active': sortBy === sort }"
            type="button"
            :aria-pressed="sortBy === sort"
            @click="setSort(sort)"
          >
            {{ sort }}
            <span
              v-if="sortBy === sort"
              class="sort-indicator"
              :class="sortDirection"
              aria-hidden="true"
            />
          </button>
        </div>

        <div class="drugs__head">
          <span />
          <div class="drugs__head-cell drugs__head-cell--product">
            <button
              class="drugs__sort-button"
              :class="{ 'is-active': sortBy === 'name' }"
              type="button"
              :aria-pressed="sortBy === 'name'"
              :aria-sort="sortAriaState('name')"
              @click="setSort('name')"
            >
              Name
              <span
                v-if="sortBy === 'name'"
                class="sort-indicator"
                :class="sortDirection"
                aria-hidden="true"
              />
            </button>
            <button
              class="drugs__sort-button"
              :class="{ 'is-active': sortBy === 'rarity' }"
              type="button"
              :aria-pressed="sortBy === 'rarity'"
              :aria-sort="sortAriaState('rarity')"
              @click="setSort('rarity')"
            >
              Rarity
              <span
                v-if="sortBy === 'rarity'"
                class="sort-indicator"
                :class="sortDirection"
                aria-hidden="true"
              />
            </button>
          </div>
          <span class="drugs__head-cell drugs__head-cell--divided">Owned</span>
          <button
            class="drugs__head-cell drugs__head-cell--divided drugs__sort-button"
            :class="{ 'is-active': sortBy === 'price' }"
            type="button"
            :aria-pressed="sortBy === 'price'"
            :aria-sort="sortAriaState('price')"
            @click="setSort('price')"
          >
            Price
            <span
              v-if="sortBy === 'price'"
              class="sort-indicator"
              :class="sortDirection"
              aria-hidden="true"
            />
          </button>
          <span class="drugs__head-cell drugs__head-cell--divided">Buy</span>
          <span class="drugs__head-cell">Sell</span>
        </div>

        <div class="drugs__body">
          <DrugRow
            v-for="row in rows"
            :key="row.drug.id"
            :row="row"
            :max-buy="maxBuyFor(row.price)"
            :history="historyFor(row.drug.id)"
            :reset-signal="resetSignal"
            @buy="(id, qty) => trade('buy', id, qty)"
            @sell="(id, qty) => trade('sell', id, qty)"
          />
        </div>
      </div>
    </Panel>

    <StreetLog />
  </div>
</template>

<style lang="scss" scoped>
.market-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

:deep(.market-panel .panel__head) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-height: 86px;
  padding: 16px 18px;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.055), transparent 68%),
    linear-gradient(180deg, #1b1b1d, #121214 60%, #0b0b0d);
  border-bottom-color: rgba(255, 255, 255, 0.1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.07),
    inset 0 -1px 0 rgba(0, 0, 0, 0.5);
}

.market-panel__heading {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  text-align: center;
}

.market-panel__title {
  margin: 0;
  color: #efb34f;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.16em;
  line-height: 1.1;
  text-transform: uppercase;
  padding-left: 0.16em;
}

.market-panel__location {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #a6a6ad;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
}

.market-panel__location svg {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.3;
}

.market-panel__reset {
  grid-column: 3;
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 11px;
  color: #b6b6bc;
  font-family: var(--sans);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.025), transparent 70%), #0f0f11;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 7px;
  cursor: pointer;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.045),
    0 3px 7px -5px #000;
  transition:
    color var(--t-fast),
    background var(--t-fast),
    border-color var(--t-fast);
}

.market-panel__reset svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.35;
}

.market-panel__reset:hover,
.market-panel__reset:focus-visible {
  color: #efb34f;
  background: #1b1b1e;
  border-color: rgba(239, 179, 79, 0.3);
  outline: none;
}

.drugs {
  --cols: 24px minmax(100px, 1fr) 54px 110px 390px 390px;
  margin: 0 calc(var(--sp-5) * -1);
  margin-top: calc(var(--sp-4) * -1);
  margin-bottom: calc(var(--sp-5) * -1);
}

.drugs__sort-bar {
  display: none;
}

.drugs__head {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: var(--cols);
  column-gap: 0;
  align-items: stretch;
  min-height: 46px;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #b5a795;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.025) 0%, rgba(255, 255, 255, 0) 60%), #050507;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 -1px 0 rgba(0, 0, 0, 0.65),
    0 12px 22px -10px rgba(0, 0, 0, 0.95),
    0 5px 10px -4px rgba(0, 0, 0, 0.6);
}

.drugs__head::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(184, 137, 63, 0.25) 12%,
    rgba(184, 137, 63, 0.7) 50%,
    rgba(184, 137, 63, 0.25) 88%,
    transparent 100%
  );
  pointer-events: none;
}

.drugs__head::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  height: 10px;
  background: linear-gradient(180deg, rgba(184, 137, 63, 0.05), transparent);
  pointer-events: none;
}

.drugs__head-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--sp-3);
}

.drugs__head-cell--product {
  gap: 4px;
}

.drugs__head-cell--divided {
  border-left: 1px solid rgba(255, 255, 255, 0.04);
}

.drugs__sort-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 28px;
  padding: 5px 7px;
  font: inherit;
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  line-height: 1;
  text-transform: uppercase;
  color: inherit;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 5px;
  cursor: pointer;
  transition:
    color var(--t-fast),
    background var(--t-fast),
    border-color var(--t-fast);
}

.drugs__head-cell.drugs__sort-button {
  width: 100%;
  min-height: 46px;
  border-radius: 0;
}

.drugs__sort-button:hover {
  color: var(--gold-soft);
  background: rgba(184, 137, 63, 0.06);
}

.drugs__sort-button.is-active {
  color: var(--gold-soft);
  background: rgba(184, 137, 63, 0.1);
  border-color: rgba(184, 137, 63, 0.18);
}

.drugs__sort-button:focus-visible {
  outline: 1px solid var(--gold);
  outline-offset: -2px;
}

.sort-indicator {
  width: 7px;
  height: 7px;
  border-top: 1.5px solid currentColor;
  border-left: 1.5px solid currentColor;
  transform: rotate(45deg) translateY(2px);
}

.sort-indicator.desc {
  transform: rotate(225deg) translateY(2px);
}

.drugs__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 8px;
  background: #0d0d10;
}

.empty {
  color: var(--muted-2);
  font-size: var(--fs-sm);
  text-align: center;
  padding: var(--sp-8) 0;
}

@media (max-width: 1500px) {
  .drugs__sort-bar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 10px 12px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.018), transparent), #080909;
    border-bottom: 1px solid var(--stroke);
  }

  .drugs__sort-label {
    margin-right: 4px;
    color: var(--muted-2);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .drugs__sort-button {
    min-height: 28px;
    padding: 5px 8px;
    color: var(--muted);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
  }

  .drugs__head,
  .drugs__head::before,
  .drugs__head::after {
    display: none;
  }
}

@media (max-width: 520px) {
  :deep(.market-panel .panel__head) {
    gap: 8px;
    padding-inline: 12px;
  }

  .market-panel__reset {
    width: 34px;
    min-height: 34px;
    justify-content: center;
    padding: 0;
  }

  .market-panel__reset span {
    display: none;
  }

  .drugs__sort-bar {
    gap: 2px;
    padding-inline: 8px;
  }

  .drugs__sort-label {
    display: none;
  }

  .drugs__sort-button {
    flex: 1;
    padding-inline: 5px;
  }
}
</style>
