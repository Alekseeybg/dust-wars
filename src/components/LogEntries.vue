<script setup lang="ts">
import type { LogEntry } from 'types';
import { logCategory } from 'domain/log';
defineProps<{ entries: LogEntry[] }>();
</script>

<template>
  <ol class="entries">
    <li v-for="(entry, i) in entries" :key="`${entry.day}-${i}`" class="entry">
      <span class="entry__day"
        ><span>Day</span><strong class="mono">{{ entry.day }}</strong></span
      >
      <div class="entry__content">
        <span class="entry__category">{{
          logCategory(entry) === 'trade' ? 'Trade' : 'Event'
        }}</span>
        <span class="entry__text">
          <span
            v-for="(segment, j) in entry.segments"
            :key="j"
            :class="{ 'entry__seg--bold': segment.bold }"
            :style="segment.color ? { color: `var(--${segment.color})` } : undefined"
            >{{ segment.text }}</span
          >
        </span>
      </div>
    </li>
  </ol>
</template>

<style lang="scss" scoped>
.entries {
  --line-height: 24px;
  --day-width: 60px;
  --gutter-gap: 16px;
  --text: #e5e1d9;
  --gold-soft: #efb34f;
  --wine-soft: #d47f73;
  --forest-soft: #a7ba80;
  --muted: #929299;
  --muted-2: #797982;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  list-style: none;
}
.entry {
  display: grid;
  grid-template-columns: var(--day-width) minmax(0, 1fr);
  align-items: start;
  gap: var(--gutter-gap);
  min-height: 64px;
  padding: 19px 12px;
  background: #0d0d0f;
  border-bottom: 1px solid rgba(255, 255, 255, 0.065);
}
.entry:nth-child(even) {
  background: #111113;
}
.entry:last-child {
  border-bottom: none;
}
.entry__day {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 2px 5px;
  color: #929299;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 20px;
  white-space: nowrap;
  text-transform: uppercase;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent 70%), #08080a;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 6px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
}
.entry__day strong {
  color: #d3d3d9;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
}
.entry__content {
  position: relative;
  min-width: 0;
  line-height: var(--line-height);
}
.entry__category {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.entry__text {
  color: var(--text);
  font-size: 14px;
  font-weight: 400;
  line-height: var(--line-height);
  overflow-wrap: anywhere;
}
.entry__seg--bold {
  font-weight: 700;
}
@media (max-width: 520px) {
  .entries {
    --day-width: 56px;
    --gutter-gap: 12px;
  }
  .entry {
    padding: 18px 8px;
  }
  .entry__text {
    font-size: 13px;
  }
}
</style>
