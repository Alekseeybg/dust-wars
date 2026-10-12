<script setup lang="ts">
defineProps<{ title: string; meta?: string }>();
</script>

<template>
  <section class="panel">
    <header class="panel__head">
      <h2 class="panel__title">{{ title }}</h2>
      <span v-if="meta" class="panel__meta mono">{{ meta }}</span>
    </header>
    <div class="panel__body">
      <slot />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.panel {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.018), rgba(255, 255, 255, 0) 40%), var(--bg-panel);
  border: 1px solid var(--stroke);
  border-radius: var(--r-md);
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.02),
    0 8px 24px -18px #000;
}
.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
  padding: 14px var(--sp-5);
  border-bottom: 1px solid var(--stroke);
  background: rgba(255, 255, 255, 0.012);
}
.panel__title {
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gold);
}
.panel__meta {
  font-size: var(--fs-sm);
  color: var(--muted);
}
.panel__body {
  padding: var(--sp-5);
}
</style>
