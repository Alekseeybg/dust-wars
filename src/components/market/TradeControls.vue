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
const isPresetActive = (preset: number) =>
  canTrade.value && !isMaxActive.value && effectiveQuantity.value === Math.min(props.max, preset);
const label = computed(() => (props.direction === 'buy' ? 'Buy' : 'Sell'));

watch(
  () => props.resetSignal,
  () => {
    quantity.value = 1;
  },
);

function setQuantity(preset: number) {
  quantity.value = Math.min(Math.max(1, props.max), preset);
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
      <button
        type="button"
        class="chip"
        :class="{ 'is-active': isPresetActive(1) }"
        :disabled="!canTrade"
        @click="setQuantity(1)"
      >
        1
      </button>
      <button
        type="button"
        class="chip"
        :class="{ 'is-active': isPresetActive(10) }"
        :disabled="!canTrade"
        @click="setQuantity(10)"
      >
        10
      </button>
      <button
        type="button"
        class="chip chip--wide"
        :class="{ 'is-active': isMaxActive }"
        :disabled="!canTrade"
        @click="setQuantity(max)"
      >
        MAX
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
  display: grid;
  grid-template-columns: max-content max-content max-content;
  justify-content: start;
  align-items: center;
  gap: 6px;
  padding: 9px 8px;
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
.trade .btn--split {
  min-width: 140px;
  white-space: nowrap;
}

.trade .chip {
  min-width: 28px;
  padding-inline: 6px;
}

.trade .chip--wide {
  min-width: 34px;
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
    grid-template-columns: max-content max-content;
    padding-inline: 6px;
  }
  .trade .chip-group {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-self: start;
  }
  .trade .btn--split {
    grid-column: 2;
    grid-row: 1;
    min-width: 120px;
    padding-inline: 10px;
  }
}

@media (max-width: 360px) {
  .trade :deep(.qty__btn) {
    width: 24px;
  }
  .trade :deep(.qty__input) {
    width: 38px;
  }
}
</style>
