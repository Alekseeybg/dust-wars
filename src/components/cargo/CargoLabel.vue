<script setup lang="ts">
defineProps<{ name: string; swatch: string }>();
</script>

<template>
  <span class="cargo-label">
    <span class="cargo-label__swatch" :style="{ background: swatch }" aria-hidden="true" />
    <span class="cargo-label__name" :title="name">{{ name }}</span>
  </span>
</template>

<style lang="scss" scoped>
.cargo-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: #e5e1d9;
  font-size: 15px;
  font-weight: 600;
}
.cargo-label__swatch {
  flex: 0 0 8px;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
}
.cargo-label__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
