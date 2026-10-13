<script setup lang="ts">
import { clamp } from 'utils/math';

const model = defineModel<number>({ required: true });
const props = withDefaults(defineProps<{ min?: number; max?: number; label?: string }>(), {
  min: 1,
  max: 9999,
  label: 'Quantity',
});

function bounded(value: number): number {
  return clamp(value, props.min, props.max);
}

function decrement() {
  model.value = bounded(model.value - 1);
}

function increment() {
  model.value = bounded(model.value + 1);
}

function onInput(event: Event) {
  const raw = Number((event.target as HTMLInputElement).value);
  model.value = bounded(Number.isFinite(raw) ? Math.floor(raw) : props.min);
}
</script>

<template>
  <div class="qty">
    <button
      class="qty__btn"
      type="button"
      :disabled="model <= min"
      aria-label="Decrease quantity"
      @click="decrement"
    >
      −
    </button>
    <input
      class="qty__input mono"
      type="number"
      :aria-label="label"
      :value="model"
      :min="min"
      :max="max"
      @input="onInput"
    />
    <button
      class="qty__btn"
      type="button"
      :disabled="model >= max"
      aria-label="Increase quantity"
      @click="increment"
    >
      +
    </button>
  </div>
</template>

<style lang="scss" scoped>
.qty {
  display: inline-flex;
  align-items: stretch;
  height: 32px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  overflow: hidden;
  transition:
    background 140ms ease,
    border-color 140ms ease;
}

/* Whole group responds to any focus inside it — a soft gold rim replaces
   the browser's default outline. */
.qty:focus-within {
  background: rgba(0, 0, 0, 0.38);
  border-color: rgba(184, 137, 63, 0.28);
}

.qty__btn {
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  color: var(--muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition:
    color 120ms ease,
    background 120ms ease;
}

.qty__btn:hover:not(:disabled) {
  color: var(--gold-soft);
  background: rgba(184, 137, 63, 0.1);
}

.qty__btn:active:not(:disabled) {
  color: var(--gold-soft);
  background: rgba(184, 137, 63, 0.18);
}

.qty__btn:focus {
  outline: none;
}

.qty__btn:focus-visible {
  outline: none;
  color: var(--gold-soft);
  background: rgba(184, 137, 63, 0.14);
}

.qty__btn:disabled {
  color: var(--muted-2);
  cursor: not-allowed;
}

.qty__input {
  width: 52px;
  padding: 0;
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  background: transparent;
  border: none;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  appearance: textfield;
  -moz-appearance: textfield;
}

.qty__input::-webkit-outer-spin-button,
.qty__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

/* Focus indication is background-only — no outline, no border flash. */
.qty__input:focus,
.qty__input:focus-visible {
  outline: none;
  outline-offset: 0;
  color: var(--gold-soft);
  background: rgba(184, 137, 63, 0.08);
}
</style>
