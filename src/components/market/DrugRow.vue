<script setup lang="ts">
import { computed, ref } from 'vue'
import { QTooltip } from 'quasar'
import type { Drug, DrugId, PriceTrend } from 'types'
import QtyStepper from './QtyStepper.vue'

export interface MarketRow {
  drug: Drug
  price: number
  trend: PriceTrend
  held: number
  pressure: { amount: number; kind: 'neutral' | 'scarce' | 'glutted' }
}

const props = defineProps<{
  row: MarketRow
  maxBuy: number
}>()

const emit = defineEmits<{
  buy: [drugId: DrugId, qty: number]
  sell: [drugId: DrugId, qty: number]
}>()

const buyQty = ref(1)
const sellQty = ref(1)

const effectiveBuy = computed(() => Math.max(1, Math.min(buyQty.value, Math.max(props.maxBuy, 1))))
const effectiveSell = computed(() => Math.max(1, Math.min(sellQty.value, Math.max(props.row.held, 1))))

const buyTotal = computed(() => props.row.price * effectiveBuy.value)
const sellTotal = computed(() => props.row.price * effectiveSell.value)

const canBuy = computed(() => props.maxBuy >= 1)
const canSell = computed(() => props.row.held >= 1)

const trendGlyph: Record<PriceTrend, string> = {
  up: '▲',
  down: '▼',
  flat: '—',
}

const presets = [10, 50] as const

function setBuyQty(n: number) { buyQty.value = n }
function setSellQty(n: number) { sellQty.value = n }
function setBuyMax() { buyQty.value = Math.max(1, props.maxBuy) }
function setSellMax() { sellQty.value = Math.max(1, props.row.held) }

function isBuyPresetActive(n: number): boolean {
  return n <= props.maxBuy && effectiveBuy.value === n
}
function isSellPresetActive(n: number): boolean {
  return n <= props.row.held && effectiveSell.value === n
}
function isBuyMaxActive(): boolean {
  return canBuy.value && effectiveBuy.value === props.maxBuy
}
function isSellMaxActive(): boolean {
  return canSell.value && effectiveSell.value === props.row.held
}

function onBuy() {
  if (!canBuy.value) return
  emit('buy', props.row.drug.id, effectiveBuy.value)
}
function onSell() {
  if (!canSell.value) return
  emit('sell', props.row.drug.id, effectiveSell.value)
}
</script>

<template>
  <div class="row">
    <span class="row__swatch" :style="{ background: props.row.drug.swatch }" />

    <div class="row__name-block">
      <span class="row__name">{{ props.row.drug.name }}</span>
      <span class="row__tier">{{ props.row.drug.tier }}</span>

      <QTooltip class="dust-tip" anchor="top middle" self="bottom middle" :offset="[0, 12]" :delay="340">
        <div class="dust-tip__name">{{ props.row.drug.name }}</div>
        <div class="dust-tip__desc">{{ props.row.drug.description }}</div>
      </QTooltip>
    </div>

    <span class="row__owned mono row__cell row__divided" :class="{ 'row__owned--empty': props.row.held === 0 }">
      {{ props.row.held }}
    </span>

    <div class="row__price-block row__cell row__divided">
      <span class="row__price mono">${{ props.row.price }}</span>
      <span class="row__trend" :class="`row__trend--${props.row.trend}`">
        {{ trendGlyph[props.row.trend] }}
      </span>
      <div v-if="props.row.pressure.amount > 0.05" class="row__pressure"
        :class="`row__pressure--${props.row.pressure.kind}`"
        :title="props.row.pressure.kind === 'scarce' ? 'Scarce — price elevated' : 'Glutted — price depressed'">
        <div class="row__pressure-fill" :style="{ width: props.row.pressure.amount * 100 + '%' }" />
      </div>
    </div>

    <div class="trade trade--buy row__divided-full" :class="{ 'trade--disabled': !canBuy }">
      <QtyStepper v-model="buyQty" :min="1" :max="Math.max(1, props.maxBuy)" />
      <div class="chip-group">
        <button v-for="p in presets" :key="`buy-${p}`" type="button" class="chip"
          :class="{ 'is-active': isBuyPresetActive(p) }" :disabled="p > props.maxBuy" @click="setBuyQty(p)">{{ p
          }}</button>
        <button type="button" class="chip chip--wide" :class="{ 'is-active': isBuyMaxActive() }" :disabled="!canBuy"
          @click="setBuyMax">MAX</button>
      </div>
      <button class="btn btn--buy btn--split btn--lg" type="button" :disabled="!canBuy" @click="onBuy">
        <span>Buy</span>
        <span class="btn__value mono">{{ canBuy ? '$' + buyTotal : '—' }}</span>
      </button>
    </div>

    <div class="trade trade--sell" :class="{ 'trade--disabled': !canSell }">
      <QtyStepper v-model="sellQty" :min="1" :max="Math.max(1, props.row.held)" />
      <div class="chip-group">
        <button v-for="p in presets" :key="`sell-${p}`" type="button" class="chip"
          :class="{ 'is-active': isSellPresetActive(p) }" :disabled="p > props.row.held" @click="setSellQty(p)">{{ p
          }}</button>
        <button type="button" class="chip chip--wide" :class="{ 'is-active': isSellMaxActive() }" :disabled="!canSell"
          @click="setSellMax">MAX</button>
      </div>
      <button class="btn btn--sell btn--split btn--lg" type="button" :disabled="!canSell" @click="onSell">
        <span>Sell</span>
        <span class="btn__value mono">{{ canSell ? '$' + sellTotal : '—' }}</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.row {
  position: relative;
  display: grid;
  grid-template-columns: var(--cols);
  column-gap: 0;
  align-items: center;
  min-height: 60px;
  background: transparent;
  transition: background 180ms ease, box-shadow 180ms ease;
}

/* Subtle zebra — even rows a hair lighter than the body.
   Reads as texture, not stripes. */
.row:nth-child(even) {
  background: rgba(255, 255, 255, .008);
}

/* Divider between rows: a hairline that peaks at center and fades at
   the edges. Replaces the hard 1px border, feels more refined. */
.row::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(255, 255, 255, .05) 10%,
      rgba(255, 255, 255, .085) 50%,
      rgba(255, 255, 255, .05) 90%,
      transparent 100%);
  pointer-events: none;
}

/* First row sits directly under the header — no top divider needed. */
.row:first-child::after {
  display: none;
}

/* Gold accent bar that slides in on hover. */
.row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg,
      transparent 0%,
      var(--gold) 50%,
      transparent 100%);
  opacity: 0;
  transition: opacity 200ms ease;
  pointer-events: none;
  z-index: 1;
}

.row:hover {
  background: rgba(255, 255, 255, .022);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .025),
    inset 0 -1px 0 rgba(0, 0, 0, .25);
}

.row:hover::before {
  opacity: .7;
}

/* ---- dividers --------------------------------------------------- */

.row__cell {
  align-self: stretch;
  display: flex;
  align-items: center;
}

.row__divided {
  border-left: 1px solid var(--stroke);
}

.row__divided-full {
  border-left: 1px solid var(--stroke);
}

/* ---- identity --------------------------------------------------- */

.row__swatch {
  justify-self: center;
  width: 3px;
  height: 22px;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, .25);
  margin: 0 var(--sp-2) 0 var(--sp-5);
  transition: height 180ms ease, filter 180ms ease;
}

.row:hover .row__swatch {
  height: 30px;
  filter: brightness(1.35) saturate(1.15);
}

.row__name-block {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px var(--sp-3) 10px var(--sp-2);
  min-width: 0;
}

.row__name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 180ms ease;
}

.row:hover .row__name {
  color: #e5dac3;
}

.row__tier {
  align-self: flex-start;
  padding: 1px 6px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--muted);
  background: rgba(255, 255, 255, .04);
  border-radius: 3px;
  line-height: 1.35;
  transition: color 180ms ease, background 180ms ease;
}

.row:hover .row__tier {
  color: #9a8b78;
  background: rgba(255, 255, 255, .06);
}

/* ---- numbers ---------------------------------------------------- */

.row__owned {
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  line-height: 1;
  padding: 0 var(--sp-3);
  transition: color 180ms ease;
}

.row__owned--empty {
  color: var(--muted-2);
}

.row:hover .row__owned--empty {
  color: var(--muted);
}

.row__price-block {
  position: relative;
  justify-content: center;
  gap: 4px;
  padding: 0 var(--sp-3) 4px;
  line-height: 1;
}

.row__price {
  font-size: 15px;
  font-weight: 600;
  color: var(--gold-soft);
  transition: color 180ms ease, text-shadow 180ms ease;
}

.row:hover .row__price {
  color: #e8bf76;
  text-shadow: 0 0 12px rgba(212, 168, 96, .35);
}

.row__trend {
  font-size: 11px;
  line-height: 1;
  align-self: center;
}

.row__trend--up {
  color: var(--wine-soft);
}

.row__trend--down {
  color: var(--forest-soft);
}

.row__trend--flat {
  color: var(--muted-2);
}

.row__pressure {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 6px;
  width: 60px;
  height: 2px;
  background: rgba(255, 255, 255, .04);
  border-radius: 1px;
  overflow: hidden;
}

.row__pressure-fill {
  height: 100%;
  border-radius: 1px;
  transition: width 220ms ease;
}

.row__pressure--scarce .row__pressure-fill {
  background: var(--wine-soft);
}

.row__pressure--glutted .row__pressure-fill {
  background: var(--forest-soft);
}

/* ---- trade groups ----------------------------------------------- */

.trade {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  height: 100%;
  transition: opacity 120ms ease, background 180ms ease;
}

.trade--buy {
  background: rgba(92, 122, 63, .07);
}

.trade--sell {
  background: rgba(138, 42, 42, .07);
  border-left: 1px solid var(--stroke);
}

.trade--disabled {
  opacity: .45;
}

.row:hover .trade--buy:not(.trade--disabled) {
  background: rgba(92, 122, 63, .11);
}

.row:hover .trade--sell:not(.trade--disabled) {
  background: rgba(138, 42, 42, .11);
}

/* ---- responsive ------------------------------------------------- */

@media (max-width: 1500px) {
  .row {
    grid-template-columns: 14px minmax(0, 1fr) 48px 80px;
    grid-template-areas:
      'swatch name  owned price'
      'buy    buy   buy   buy'
      'sell   sell  sell  sell';
    row-gap: 8px;
    column-gap: 12px;
    padding: 14px var(--sp-5);
    min-height: 0;
  }

  .row::after,
  .row::before {
    display: none;
  }

  .row__swatch {
    grid-area: swatch;
    width: 14px;
    height: 14px;
    border-radius: 4px;
    margin: 0;
  }

  .row__name-block {
    grid-area: name;
    padding: 0;
  }

  .row__owned {
    grid-area: owned;
    padding: 0;
  }

  .row__price-block {
    grid-area: price;
    padding: 0 0 4px;
  }

  .row__divided,
  .row__divided-full {
    border-left: none;
  }

  .row__pressure {
    position: static;
    margin-top: 4px;
    width: 100%;
    transform: none;
    left: auto;
  }

  .trade--buy {
    grid-area: buy;
    border-radius: 8px;
  }

  .trade--sell {
    grid-area: sell;
    border-left: none;
    border-radius: 8px;
  }
}

@media (max-width: 520px) {
  .trade {
    flex-wrap: wrap;
  }

  .trade .btn {
    flex: 1 0 100%;
    min-width: 0;
  }
}
</style>
