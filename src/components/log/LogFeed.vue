<script setup lang="ts">
import { computed } from 'vue';
import type { LogEntry } from 'types';
import LogEntries from '../LogEntries.vue';
import type { LogFilter } from './types';
import { useLogFeed } from './useLogFeed';

const props = defineProps<{ entries: readonly LogEntry[]; limit?: number }>();
const filter = defineModel<LogFilter>('filter', { default: 'all' });
const filters = [
  { value: 'all', label: 'All' },
  { value: 'trade', label: 'Trades' },
  { value: 'event', label: 'Events' },
] as const;

const { counts, visibleEntries } = useLogFeed(
  () => props.entries,
  filter,
  () => props.limit,
);
const emptyMessage = computed(() => {
  if (filter.value === 'trade') return 'Your purchases and sales will appear here.';
  if (filter.value === 'event') return 'Market changes and street events will appear here.';
  return 'Your activity will appear here as the game unfolds.';
});
</script>

<template>
  <div class="log-feed">
    <div class="log-feed__toolbar">
      <div class="log-feed__filters" role="group" aria-label="Filter street log">
        <button
          v-for="option in filters"
          :key="option.value"
          type="button"
          class="log-feed__filter"
          :class="{ 'is-active': filter === option.value }"
          :aria-pressed="filter === option.value"
          :aria-label="`${option.label}, ${counts[option.value]} entries`"
          @click="filter = option.value"
        >
          {{ option.label }}
          <span class="log-feed__count mono" aria-hidden="true">{{ counts[option.value] }}</span>
        </button>
      </div>
    </div>

    <div class="log-feed__body">
      <LogEntries v-if="visibleEntries.length" :entries="visibleEntries" />
      <div v-else class="log-feed__empty" role="status">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" />
        </svg>
        <strong>{{
          filter === 'all'
            ? 'No activity yet'
            : `No ${filter === 'trade' ? 'trades' : 'events'} yet`
        }}</strong>
        <span>{{ emptyMessage }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.log-feed {
  color: #e5e1d9;
}
.log-feed__toolbar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent), #0b0b0d;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}
.log-feed__filters {
  display: inline-flex;
  gap: 4px;
  padding: 3px;
  background: #08080a;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 9px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.45);
}
.log-feed__filter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 32px;
  padding: 5px 12px;
  color: #a6a6ad;
  font: 600 11px var(--sans);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition:
    background var(--t-fast),
    color var(--t-fast),
    border-color var(--t-fast);
}
.log-feed__filter:hover {
  color: #e5e1d9;
  background: #171719;
}
.log-feed__filter.is-active {
  color: #efb34f;
  background: linear-gradient(180deg, #242427, #19191c);
  border-color: rgba(239, 179, 79, 0.24);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
.log-feed__filter:focus-visible {
  outline: 2px solid #efb34f;
  outline-offset: 1px;
}
.log-feed__count {
  min-width: 18px;
  padding: 2px 4px;
  color: #8f8f96;
  font-size: 9px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  text-align: center;
}
.is-active .log-feed__count {
  color: #efb34f;
}
.log-feed__body {
  padding: 12px 16px;
}
.log-feed__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 30px 12px;
  text-align: center;
}
.log-feed__empty svg {
  width: 26px;
  height: 26px;
  fill: none;
  stroke: #929299;
  stroke-width: 1.3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.log-feed__empty strong {
  font-size: 14px;
  font-weight: 600;
}
.log-feed__empty span {
  max-width: 280px;
  color: #929299;
  font-size: 12px;
  line-height: 1.5;
}
@media (max-width: 520px) {
  .log-feed__toolbar {
    padding: 10px;
  }
  .log-feed__filters {
    flex: 1;
  }
  .log-feed__filter {
    flex: 1;
    gap: 5px;
    padding-inline: 7px;
  }
  .log-feed__body {
    padding: 10px 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .log-feed__filter {
    transition: none;
  }
}
</style>
