<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Notify } from 'quasar'
import { useGameStore } from 'stores/game'
import { DRUGS } from 'data/drugs'
import { supplyAt, supplyPressure } from 'domain/pricing'
import type { DrugId, PricePoint } from 'types'
import Panel from 'components/Panel.vue'
import StreetLog from 'components/StreetLog.vue'
import DrugRow, { type MarketRow } from 'components/market/DrugRow.vue'

const game = useGameStore()
const { market, supply, city, cash, capacity } = storeToRefs(game)

/** Bumping this causes every row to reset its local quantities to 1. */
const resetSignal = ref(0)
function resetAllQuantities() {
  resetSignal.value += 1
}

const freeSpace = computed(() => capacity.value - game.cargoUsed)

const rows = computed<MarketRow[]>(() => {
  if (!market.value) return []
  return DRUGS.map((drug) => {
    const supplyLevel = supplyAt(supply.value, game.cityId, drug.id)
    return {
      drug,
      price: market.value!.prices[drug.id],
      trend: market.value!.trends[drug.id],
      held: game.heldQty(drug.id),
      pressure: supplyPressure(supplyLevel),
    }
  })
})

function historyFor(drugId: DrugId): PricePoint[] {
  return game.marketHistory[game.cityId]?.[drugId] ?? []
}

function maxBuyFor(price: number): number {
  const byCash = Math.floor(cash.value / price)
  return Math.max(0, Math.min(byCash, freeSpace.value))
}

function onBuy(drugId: DrugId, qty: number) {
  const result = game.buy(drugId, qty)
  if (!result.ok) Notify.create({ type: 'negative', message: result.reason })
}
function onSell(drugId: DrugId, qty: number) {
  const result = game.sell(drugId, qty)
  if (!result.ok) Notify.create({ type: 'negative', message: result.reason })
}
</script>

<template>
  <div class="market-page">
    <Panel title="Market" :subtitle="city.name">
      <template #action>
        <button class="reset-all" type="button" @click="resetAllQuantities">
          Reset Qty
        </button>
      </template>

      <div v-if="!market" class="empty">Market data unavailable.</div>

      <div v-else class="drugs">
        <div class="drugs__head">
          <span />
          <span class="drugs__head-cell">Drug</span>
          <span class="drugs__head-cell drugs__head-cell--divided">Owned</span>
          <span class="drugs__head-cell drugs__head-cell--divided">Price</span>
          <span class="drugs__head-cell drugs__head-cell--divided">Buy</span>
          <span class="drugs__head-cell">Sell</span>
        </div>

        <div class="drugs__body">
          <DrugRow v-for="row in rows" :key="row.drug.id" :row="row" :max-buy="maxBuyFor(row.price)"
            :history="historyFor(row.drug.id)" :reset-signal="resetSignal" @buy="onBuy" @sell="onSell" />
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

.reset-all {
  padding: 4px 8px;
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: color 120ms ease, background 120ms ease, border-color 120ms ease;
  white-space: nowrap;
}

.reset-all:hover {
  color: var(--gold-soft);
  background: rgba(184, 137, 63, .08);
  border-color: rgba(184, 137, 63, .18);
}

.drugs {
  --cols: 24px minmax(110px, 1fr) 76px 96px 340px 340px;
  margin: 0 calc(var(--sp-5) * -1);
  margin-top: calc(var(--sp-4) * -1);
  margin-bottom: calc(var(--sp-5) * -1);
}

.drugs__head {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: var(--cols);
  column-gap: 0;
  align-items: stretch;
  min-height: 46px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .20em;
  text-transform: uppercase;
  color: #b5a795;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .025) 0%, rgba(255, 255, 255, 0) 60%),
    #050507;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .05),
    inset 0 -1px 0 rgba(0, 0, 0, .65),
    0 12px 22px -10px rgba(0, 0, 0, .95),
    0 5px 10px -4px rgba(0, 0, 0, .6);
}

.drugs__head::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(184, 137, 63, .25) 12%, rgba(184, 137, 63, .70) 50%, rgba(184, 137, 63, .25) 88%, transparent 100%);
  pointer-events: none;
}

.drugs__head::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  height: 10px;
  background: linear-gradient(180deg, rgba(184, 137, 63, .05), transparent);
  pointer-events: none;
}

.drugs__head-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--sp-3);
}

.drugs__head-cell--divided {
  border-left: 1px solid rgba(255, 255, 255, .04);
}

.drugs__body {
  position: relative;
  z-index: 1;
  background: #0d0d10;
}

.empty {
  color: var(--muted-2);
  font-size: var(--fs-sm);
  text-align: center;
  padding: var(--sp-8) 0;
}

@media (max-width: 1500px) {

  .drugs__head,
  .drugs__head::before,
  .drugs__head::after {
    display: none;
  }
}
</style>
