<script setup lang="ts">
defineProps<{ day: number; size?: 'compact' | 'regular' }>();
</script>

<template>
  <span class="day-badge" :class="{ 'day-badge--regular': size === 'regular' }"
    ><span>Day</span><strong class="mono">{{ day }}</strong></span
  >
</template>

<style lang="scss" scoped>
.day-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 56px;
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
.day-badge strong {
  color: #d3d3d9;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
}
.day-badge--regular {
  min-width: 74px;
  padding: 4px 8px;
  color: #a6a6ad;
  font-size: 12px;
  line-height: 22px;
}
.day-badge--regular strong {
  color: #e5e1d9;
  font-size: 16px;
}
</style>
