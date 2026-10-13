<script setup lang="ts">
import { computed, ref } from 'vue';
import { QMenu, QTooltip } from 'quasar';
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
const trendLabel: Record<PriceTrend, string> = {
  up: 'Price is rising',
  down: 'Price is falling',
  flat: 'Price is holding steady',
};
const hasHistory = computed(() => props.history.length >= 2);
const historyTrigger = ref<HTMLButtonElement>();
const historyHeading = ref<HTMLDivElement>();

function positionHistoryPointer() {
  const trigger = historyTrigger.value;
  const popup = historyHeading.value?.closest<HTMLElement>('.price-history-menu');
  if (!trigger || !popup) return;

  const anchor = trigger.getBoundingClientRect();
  const bounds = popup.getBoundingClientRect();
  const pointerX = Math.max(
    16,
    Math.min(bounds.width - 16, anchor.left + anchor.width / 2 - bounds.left),
  );
  popup.style.setProperty('--history-pointer-x', `${pointerX}px`);
  popup.dataset.pointerSide = bounds.top < anchor.top ? 'bottom' : 'top';
}
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
      <div class="row__price-main">
        <span class="row__price mono">${{ props.row.price }}</span>
        <span
          class="row__trend"
          :class="`row__trend--${props.row.trend}`"
          role="img"
          :aria-label="trendLabel[props.row.trend]"
        >
          <svg v-if="props.row.trend === 'up'" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M6 1.25 10.5 5.75H7.5V11h-3V5.75H1.5L6 1.25Z" />
          </svg>
          <svg v-else-if="props.row.trend === 'down'" viewBox="0 0 12 12" aria-hidden="true">
            <path d="m6 10.75-4.5-4.5h3V1h3v5.25h3l-4.5 4.5Z" />
          </svg>
          <svg v-else viewBox="0 0 12 12" aria-hidden="true">
            <path d="M1.25 4.5h9.5v3h-9.5z" />
          </svg>
        </span>

        <button
          ref="historyTrigger"
          class="row__history-trigger"
          type="button"
          :disabled="!hasHistory"
          :aria-label="
            hasHistory ? 'View price history' : 'Price history will appear after the market changes'
          "
          :title="
            hasHistory ? 'View price history' : 'Price history will appear after the market changes'
          "
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="m9.15 1.5-5.3 6.1h3.4L6.85 14.5l5.3-6.1h-3.4l.4-6.9Z" />
          </svg>

          <QMenu
            v-if="hasHistory"
            class="price-history-menu"
            anchor="bottom middle"
            self="top middle"
            :offset="[0, 10]"
            @show="positionHistoryPointer"
          >
            <div ref="historyHeading" class="price-history-menu__head">Price History</div>
            <ul class="price-history">
              <li
                v-for="(point, i) in historyRows"
                :key="`${point.day}-${i}`"
                class="price-history__row"
              >
                <span class="price-history__day mono">Day {{ point.day }}</span>
                <span class="price-history__price mono">${{ point.price }}</span>
                <span
                  class="price-history__delta mono"
                  :class="`price-history__delta--${point.deltaClass}`"
                >
                  {{ point.deltaLabel }}
                </span>
              </li>
            </ul>
          </QMenu>
        </button>
      </div>
      <div
        v-if="props.row.pressure.amount > 0.05"
        class="row__pressure"
        :class="`row__pressure--${props.row.pressure.kind}`"
      />
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
  min-height: 68px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.022), transparent 56%),
    linear-gradient(115deg, rgba(255, 255, 255, 0.012), transparent 42%), #0b0c0b;
  border: 1px solid rgba(214, 204, 184, 0.075);
  border-radius: 10px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.035),
    inset 0 -1px 0 rgba(0, 0, 0, 0.32),
    0 4px 10px -10px rgba(0, 0, 0, 0.95);
  transition:
    background 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.row:nth-child(even) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.028), transparent 56%),
    linear-gradient(115deg, rgba(255, 255, 255, 0.018), transparent 42%), #0d0e0d;
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
  transform: translateX(2px);
  background:
    radial-gradient(ellipse at 16% 50%, rgba(184, 137, 63, 0.09), transparent 46%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent 56%), #10110f;
  border-color: rgba(184, 137, 63, 0.24);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.055),
    inset 0 -1px 0 rgba(0, 0, 0, 0.35),
    0 10px 20px -16px rgba(0, 0, 0, 0.95);
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
  border-left: 1px solid rgba(214, 204, 184, 0.07);
}

.row__divided-full {
  border-left: 1px solid rgba(214, 204, 184, 0.07);
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
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  padding: 7px var(--sp-3) 10px;
  line-height: 1;
}

.row__price-main {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
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
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  line-height: 1;
}

.row__trend svg {
  width: 17px;
  height: 17px;
  fill: currentColor;
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

.row__history-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  padding: 0;
  color: var(--gold-dim);
  background: rgba(0, 0, 0, 0.19);
  border: 1px solid rgba(214, 204, 184, 0.1);
  border-radius: 5px;
  cursor: pointer;
  transition:
    color var(--t-fast),
    background var(--t-fast),
    border-color var(--t-fast);
}

.row__history-trigger svg {
  width: 13px;
  height: 13px;
  fill: currentColor;
}

.row__history-trigger:hover:not(:disabled),
.row__history-trigger:focus-visible {
  color: var(--gold-soft);
  background: rgba(184, 137, 63, 0.12);
  border-color: rgba(184, 137, 63, 0.32);
  outline: none;
}

.row__history-trigger:disabled {
  color: var(--muted-2);
  cursor: not-allowed;
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
  margin: 0;
  padding: 0;
  min-width: 150px;
  list-style: none;
}

:global(.price-history-menu) {
  --history-surface: #12120f;
  --history-surface-top: #1a1a17;
  --history-border: #372c1a;
  overflow: visible;
  min-width: 274px;
  padding: 14px;
  color: var(--text);
  background: linear-gradient(180deg, var(--history-surface-top), var(--history-surface) 50%);
  border: 1px solid var(--history-border);
  border-radius: 10px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.055),
    0 20px 38px -14px rgba(0, 0, 0, 0.96);
}

:global(.price-history-menu::before) {
  position: absolute;
  top: -9px;
  left: var(--history-pointer-x, 50%);
  width: 0;
  height: 0;
  content: '';
  border-right: 9px solid transparent;
  border-bottom: 9px solid var(--history-border);
  border-left: 9px solid transparent;
  transform: translateX(-50%);
}

:global(.price-history-menu::after) {
  position: absolute;
  top: -7px;
  left: var(--history-pointer-x, 50%);
  width: 0;
  height: 0;
  content: '';
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--history-surface-top);
  border-left: 8px solid transparent;
  transform: translateX(-50%);
}

:global(.price-history-menu[data-pointer-side='bottom']::before) {
  top: auto;
  bottom: -9px;
  border-top: 9px solid var(--history-border);
  border-bottom: 0;
}

:global(.price-history-menu[data-pointer-side='bottom']::after) {
  top: auto;
  bottom: -7px;
  border-top: 8px solid var(--history-surface);
  border-bottom: 0;
}

:global(.price-history-menu__head) {
  padding: 1px 2px 10px;
  margin-bottom: 9px;
  color: var(--gold-soft);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(214, 204, 184, 0.1);
}

.price-history__row {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: 12px;
  align-items: baseline;
  min-height: 25px;
  padding: 5px 4px;
  font-size: 14px;
  line-height: 1.25;
  border-radius: 5px;
}

.price-history__row:nth-child(even) {
  background: rgba(255, 255, 255, 0.03);
}

.price-history__day {
  font-size: 11px;
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
  min-width: 48px;
  text-align: right;
  font-weight: 600;
  font-size: 12px;
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
    grid-template-columns: 14px minmax(0, 1fr) 48px 106px;
    grid-template-areas:
      'swatch name  owned price'
      'buy    buy   buy   buy'
      'sell   sell  sell  sell';
    row-gap: 9px;
    column-gap: 12px;
    padding: 14px;
    min-height: 0;
  }

  .row::before {
    left: 0;
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

@media (max-width: 520px) {
  .row {
    grid-template-columns: 12px minmax(0, 1fr) 34px 94px;
    column-gap: 8px;
    padding: 12px 10px;
  }

  .row__owned {
    font-size: 13px;
  }
}
</style>
