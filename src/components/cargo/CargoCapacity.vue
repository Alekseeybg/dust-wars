<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ used: number; capacity: number }>();
const percent = computed(() =>
  props.capacity > 0 ? Math.max(0, Math.min(100, (props.used / props.capacity) * 100)) : 0,
);
const remaining = computed(() => Math.max(0, props.capacity - props.used));
const warning = computed(() => percent.value >= 90);
</script>

<template>
  <div class="cargo-capacity" :class="{ 'cargo-capacity--warning': warning }">
    <div class="cargo-capacity__head">
      <span class="cargo-capacity__label">Capacity</span>
      <span class="cargo-capacity__value mono">
        {{ used }}<span class="cargo-capacity__max"> / {{ capacity }}g</span>
      </span>
    </div>
    <div
      class="cargo-capacity__track"
      role="meter"
      aria-label="Cargo capacity"
      :aria-valuemin="0"
      :aria-valuemax="Math.max(1, capacity)"
      :aria-valuenow="Math.max(0, Math.min(used, Math.max(1, capacity)))"
      :aria-valuetext="`${used} of ${capacity} grams used`"
    >
      <div class="cargo-capacity__fill" :style="{ width: `${percent}%` }" />
    </div>
    <div class="cargo-capacity__foot">
      <span>{{ remaining }}g available</span>
      <span v-if="warning" class="cargo-capacity__status">
        {{ remaining === 0 ? 'Hold full' : 'Nearly full' }}
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cargo-capacity {
  padding: 4px 0;
}
.cargo-capacity__head,
.cargo-capacity__foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}
.cargo-capacity__label {
  color: #a6a6ad;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.cargo-capacity__value {
  color: #efb34f;
  font-size: 17px;
  font-weight: 600;
  white-space: nowrap;
}
.cargo-capacity__max {
  color: #a6a6ad;
  font-size: 12px;
  font-weight: 400;
}
.cargo-capacity__track {
  height: 8px;
  margin-top: 10px;
  overflow: hidden;
  background: #070709;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.6);
}
.cargo-capacity__fill {
  height: 100%;
  background: linear-gradient(90deg, #c48e35, #efb34f);
  border-radius: 3px;
  transition: width var(--t-med);
}
.cargo-capacity__foot {
  margin-top: 8px;
  color: #929299;
  font-size: 10px;
  line-height: 1.3;
}
.cargo-capacity__status {
  color: #e45b54;
  font-weight: 500;
}
.cargo-capacity--warning .cargo-capacity__fill {
  background: linear-gradient(90deg, #b72d29, #e0443c);
}
@media (prefers-reduced-motion: reduce) {
  .cargo-capacity__fill {
    transition: none;
  }
}
</style>
