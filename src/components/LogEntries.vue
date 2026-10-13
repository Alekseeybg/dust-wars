<script setup lang="ts">
import type { LogEntry } from 'types';
defineProps<{ entries: LogEntry[]; compact?: boolean }>();
</script>

<template>
  <ol class="entries" :class="{ 'entries--compact': compact }">
    <li v-for="(entry, i) in entries" :key="`${entry.day}-${i}`" class="entry">
      <span class="entry__day mono">D{{ entry.day }}</span>
      <span class="entry__text">
        <span
          v-for="(segment, j) in entry.segments"
          :key="j"
          :class="{ 'entry__seg--bold': segment.bold }"
          :style="segment.color ? { color: `var(--${segment.color})` } : undefined"
          >{{ segment.text }}</span
        >
      </span>
    </li>
  </ol>
</template>

<style lang="scss" scoped>
.entries {
  --day-width: 44px;
  --entry-font-size: 14px;
  --day-font-size: 11px;
  --day-padding: 2px;
  display: flex;
  flex-direction: column;
}
.entries--compact {
  --day-width: 48px;
  --entry-font-size: 15px;
  --day-font-size: 12px;
  --day-padding: 3px;
}
.entry {
  display: grid;
  grid-template-columns: var(--day-width) 1fr;
  gap: 14px;
  padding: 10px 0;
  font-size: var(--entry-font-size);
  line-height: 1.55;
  border-bottom: 1px solid var(--stroke);
}
.entry:last-child {
  border-bottom: none;
}
.entry__day {
  padding-top: var(--day-padding);
  font-size: var(--day-font-size);
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--muted-2);
}
.entry__text {
  color: var(--text);
}
.entry__seg--bold {
  font-weight: 700;
}
</style>
