<script setup lang="ts">
import { computed } from 'vue';
import { QTooltip } from 'quasar';
import type { DrugId, PricePoint, PriceTrend } from 'types';
import type { MarketRow } from './types';
import TradeControls from './TradeControls.vue';

const props = defineProps<{
  row: MarketRow;
  maxBuy: number;
  history: PricePoint[];
  resetSignal: number;
}>();
const emit = defineEmits<{
  buy: [drugId: DrugId, qty: number];
  sell: [drugId: DrugId, qty: number];
}>();
const trendGlyph: Record<PriceTrend, string> = { up: '▲', down: '▼', flat: '—' };
const hasHistory = computed(() => props.history.length >= 2);
const historyRows = computed(() =>
  props.history.map((point, index) => {
    const previous = props.history[index - 1];
    const delta = previous ? point.price - previous.price : undefined;
    return {
      ...point,
      deltaLabel:
        delta === undefined
          ? ''
          : delta === 0
            ? '—'
            : `${delta > 0 ? '+' : '−'}$${Math.abs(delta)}`,
      deltaClass: delta === undefined || delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down',
    };
  }),
);
</script>

<template>
  <div class="row">
    <span class="row__swatch" :style="{ background: props.row.drug.swatch }" />

    <div class="row__name-block">
      <span class="row__name">{{ props.row.drug.name }}</span>
      <span class="row__tier">{{ props.row.drug.tier }}</span>

      <QTooltip
        class="dust-tip"
        anchor="top middle"
        self="bottom middle"
        :offset="[0, 12]"
        :delay="340"
      >
        <div class="dust-tip__name">{{ props.row.drug.name }}</div>
        <div class="dust-tip__desc">{{ props.row.drug.description }}</div>
      </QTooltip>
    </div>

    <span
      class="row__owned mono row__cell row__divided"
      :class="{ 'row__owned--empty': props.row.held === 0 }"
    >
      {{ props.row.held }}
    </span>

    <div class="row__price-block row__cell row__divided">
      <span class="row__price mono">${{ props.row.price }}</span>
      <span class="row__trend" :class="`row__trend--${props.row.trend}`">
        {{ trendGlyph[props.row.trend] }}
      </span>
      <div
        v-if="props.row.pressure.amount > 0.05"
        class="row__pressure"
        :class="`row__pressure--${props.row.pressure.kind}`"
      />

      <QTooltip
        v-if="hasHistory"
        class="dust-tip"
        anchor="top middle"
        self="bottom middle"
        :offset="[0, 12]"
        :delay="220"
      >
        <div class="dust-tip__name">Price History</div>
        <ul class="price-history">
          <li
            v-for="(point, i) in historyRows"
            :key="`${point.day}-${i}`"
            class="price-history__row"
          >
            <span class="price-history__day mono">D{{ point.day }}</span>
            <span class="price-history__price mono">${{ point.price }}</span>
            <span
              class="price-history__delta mono"
              :class="`price-history__delta--${point.deltaClass}`"
            >
              {{ point.deltaLabel }}
            </span>
          </li>
        </ul>
      </QTooltip>
    </div>

    <TradeControls
      class="row__divided-full"
      direction="buy"
      :drug-name="row.drug.name"
      :price="row.price"
      :max="maxBuy"
      :reset-signal="resetSignal"
      @trade="emit('buy', row.drug.id, $event)"
    />
    <TradeControls
      direction="sell"
      :drug-name="row.drug.name"
      :price="row.price"
      :max="row.held"
      :reset-signal="resetSignal"
      @trade="emit('sell', row.drug.id, $event)"
    />
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
  transition:
    background 180ms ease,
    box-shadow 180ms ease;
}

.row:nth-child(even) {
  background: rgba(255, 255, 255, 0.008);
}

.row::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.05) 10%,
    rgba(255, 255, 255, 0.085) 50%,
    rgba(255, 255, 255, 0.05) 90%,
    transparent 100%
  );
  pointer-events: none;
}

.row:first-child::after {
  display: none;
}

.row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, transparent 0%, var(--gold) 50%, transparent 100%);
  opacity: 0;
  transition: opacity 200ms ease;
  pointer-events: none;
  z-index: 1;
}

.row:hover {
  background: rgba(255, 255, 255, 0.022);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.025),
    inset 0 -1px 0 rgba(0, 0, 0, 0.25);
}

.row:hover::before {
  opacity: 0.7;
}

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

.row__swatch {
  justify-self: center;
  width: 3px;
  height: 22px;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
  margin: 0 var(--sp-2) 0 var(--sp-5);
  transition:
    height 180ms ease,
    filter 180ms ease;
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
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  line-height: 1.35;
  transition:
    color 180ms ease,
    background 180ms ease;
}

.row:hover .row__tier {
  color: #9a8b78;
  background: rgba(255, 255, 255, 0.06);
}

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
  cursor: help;
}

.row__price {
  font-size: 15px;
  font-weight: 600;
  color: var(--gold-soft);
  transition:
    color 180ms ease,
    text-shadow 180ms ease;
}

.row:hover .row__price {
  color: #e8bf76;
  text-shadow: 0 0 12px rgba(212, 168, 96, 0.35);
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
  background: rgba(255, 255, 255, 0.04);
  border-radius: 1px;
  overflow: hidden;
}

.row__pressure--scarce {
  background: rgba(184, 74, 74, 0.5);
}

.row__pressure--glutted {
  background: rgba(130, 163, 93, 0.5);
}

.price-history {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
}

.price-history__row {
  display: grid;
  grid-template-columns: 32px 1fr auto;
  gap: 8px;
  align-items: baseline;
  font-size: 12.5px;
  line-height: 1.2;
}

.price-history__day {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--muted-2);
}

.price-history__price {
  color: var(--text);
  font-weight: 600;
  text-align: right;
}

.price-history__delta {
  min-width: 42px;
  text-align: right;
  font-weight: 600;
  font-size: 11.5px;
}

.price-history__delta--up {
  color: var(--wine-soft);
}

.price-history__delta--down {
  color: var(--forest-soft);
}

.price-history__delta--flat {
  color: var(--muted-2);
}

.row:hover .trade--buy:not(.trade--disabled) {
  background: rgba(92, 122, 63, 0.11);
}

.row:hover .trade--sell:not(.trade--disabled) {
  background: rgba(138, 42, 42, 0.11);
}

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
}
</style>
