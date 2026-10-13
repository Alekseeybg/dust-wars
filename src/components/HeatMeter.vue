<script setup lang="ts">
import { computed } from 'vue';
import { CONFIG } from 'data/config';

const props = defineProps<{ level: number; max: number }>();

const hot = computed(() => props.level >= CONFIG.HEAT_WARNING_LEVEL);
const pips = computed(() => Array.from({ length: props.max }, (_, i) => i < props.level));
</script>

<template>
  <div class="heat">
    <div class="heat__head" aria-hidden="true">
      <span class="heat__label">Heat</span>
      <span class="heat__value mono"
        >{{ level }}<span> / {{ max }}</span></span
      >
    </div>
    <span
      class="meter"
      :class="{ 'meter--hot': hot }"
      role="meter"
      aria-label="Heat"
      :aria-valuenow="level"
      aria-valuemin="0"
      :aria-valuemax="max"
      :aria-valuetext="`${level} out of ${max}`"
    >
      <span v-for="(on, i) in pips" :key="i" class="meter__pip" :class="{ 'is-on': on }" />
    </span>
  </div>
</template>

<style lang="scss" scoped>
.heat {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.heat__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
}
.heat__label {
  color: var(--header-muted, var(--muted));
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  line-height: 1;
  text-transform: uppercase;
}
.heat__value {
  color: var(--header-text, var(--text));
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}
.heat__value span {
  color: var(--header-muted, var(--muted));
  font-size: 10px;
  font-weight: 400;
}
.meter {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 12px;
}
.meter__pip {
  flex: 0 0 auto;
  width: 6px;
  height: 10px;
  background: #222d38;
  border: 1px solid rgba(166, 184, 200, 0.12);
  border-radius: 2px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
  transition:
    background var(--t-med),
    border-color var(--t-med);
}
.meter__pip.is-on {
  background: linear-gradient(180deg, #f1c773, #c58b32);
  border-color: rgba(239, 179, 79, 0.65);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
}
.meter--hot .meter__pip.is-on {
  background: var(--header-coral, #dc877a);
  border-color: var(--header-coral, #dc877a);
}
@media (max-width: 600px) {
  .heat__label {
    font-size: 9px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .meter__pip {
    transition: none;
  }
}
</style>
