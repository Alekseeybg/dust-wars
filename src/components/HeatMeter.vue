<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ level: number; max: number }>();

const hot = computed(() => props.level >= 6);
const pips = computed(() => Array.from({ length: props.max }, (_, i) => i < props.level));
</script>

<template>
  <div class="stat">
    <span class="stat__label">Heat</span>
    <span
      class="meter"
      :class="{ 'meter--hot': hot }"
      role="meter"
      :aria-valuenow="level"
      aria-valuemin="0"
      :aria-valuemax="max"
    >
      <span v-for="(on, i) in pips" :key="i" class="meter__pip" :class="{ 'is-on': on }" />
    </span>
  </div>
</template>

<style lang="scss" scoped>
.stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stat__label {
  font-size: var(--fs-label);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
}
.meter {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 16px;
}
.meter__pip {
  width: 4px;
  height: 10px;
  border-radius: 1px;
  background: var(--muted-2);
  opacity: 0.28;
  transition:
    background var(--t-med),
    opacity var(--t-med),
    height var(--t-med);
}
.meter__pip.is-on {
  opacity: 1;
  height: 16px;
  background: var(--gold);
}
.meter--hot .meter__pip.is-on {
  background: var(--wine-soft);
}
</style>
