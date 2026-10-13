<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { TradeDirection } from 'types';
import { clamp } from 'utils/math';
import QtyStepper from './QtyStepper.vue';

const props = defineProps<{
  direction: TradeDirection;
  drugName: string;
  price: number;
  max: number;
  resetSignal: number;
}>();
const emit = defineEmits<{ trade: [qty: number] }>();

const quantity = ref(1);
const effectiveQuantity = computed(() => clamp(quantity.value, 1, Math.max(props.max, 1)));
const canTrade = computed(() => props.max >= 1);
const total = computed(() => props.price * effectiveQuantity.value);
const isMaxActive = computed(() => canTrade.value && effectiveQuantity.value === props.max);
const label = computed(() => (props.direction === 'buy' ? 'Buy' : 'Sell'));

watch(
  () => props.resetSignal,
  () => {
    quantity.value = 1;
  },
);

function addTen() {
  quantity.value = Math.min(props.max, quantity.value + 10);
}

function trade() {
  if (canTrade.value) emit('trade', effectiveQuantity.value);
}
</script>

<template>
  <div class="trade" :class="[`trade--${direction}`, { 'trade--disabled': !canTrade }]">
    <QtyStepper
      v-model="quantity"
      :min="1"
      :max="Math.max(1, max)"
      :label="`${label} quantity for ${drugName}`"
    />
    <div class="chip-group">
      <button type="button" class="chip" :disabled="quantity >= max" @click="addTen">+10</button>
      <button
        type="button"
        class="chip chip--wide"
        :class="{ 'is-active': isMaxActive }"
        :disabled="!canTrade"
        @click="quantity = Math.max(1, max)"
      >
        MAX
      </button>
      <button
        type="button"
        class="chip"
        :disabled="quantity === 1"
        :aria-label="`Reset ${direction} quantity for ${drugName}`"
        @click="quantity = 1"
      >
        ↺
      </button>
    </div>
    <button
      class="btn btn--split btn--lg"
      :class="`btn--${direction}`"
      type="button"
      :disabled="!canTrade"
      @click="trade"
    >
      <span>{{ label }}</span>
      <span class="btn__value mono">{{ canTrade ? '$' + total : '—' }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.trade {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  height: 100%;
  transition:
    opacity 120ms ease,
    background 180ms ease;
}
.trade--buy {
  background: rgba(92, 122, 63, 0.07);
}
.trade--sell {
  background: rgba(138, 42, 42, 0.07);
  border-left: 1px solid var(--stroke);
}
.trade--disabled {
  opacity: 0.45;
}
@media (max-width: 1500px) {
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
