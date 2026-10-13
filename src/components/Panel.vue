<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  meta?: string;
  metaLabel?: string;
  variant?: 'sidebar';
}>();
</script>

<template>
  <section class="panel" :class="{ 'panel--sidebar': variant === 'sidebar' }">
    <header class="panel__head">
      <slot name="header">
        <div class="panel__title-block">
          <h2 class="panel__title">{{ title }}</h2>
          <span v-if="subtitle" class="panel__subtitle">{{ subtitle }}</span>
        </div>

        <div class="panel__right">
          <!-- If the parent supplies an action slot, it takes over the
               right side. Otherwise, fall back to the meta stat display. -->
          <slot name="action">
            <div v-if="meta" class="panel__stat">
              <span v-if="metaLabel" class="panel__stat-label">{{ metaLabel }}</span>
              <span class="panel__stat-value">{{ meta }}</span>
            </div>
          </slot>
        </div>
      </slot>
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
  border-radius: 6px;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.02),
    0 8px 24px -18px #000;
}

.panel__head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--stroke);
  background: rgba(255, 255, 255, 0.014);
}

.panel__title-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.panel__title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--gold-soft);
  line-height: 1.2;
  padding-left: 0.26em;
}

.panel__subtitle {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--muted);
  line-height: 1;
  padding-left: 0.26em;
}

.panel__right {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}

.panel__stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  min-width: 0;
  max-width: 200px;
}

.panel__stat-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted-2);
  line-height: 1;
}

.panel__stat-value {
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--text);
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel__body {
  padding: 18px;
}

.panel--sidebar {
  background: #0b0b0d;
  border-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
.panel--sidebar .panel__head {
  padding: 0;
  border-bottom-color: rgba(255, 255, 255, 0.1);
}
.panel--sidebar .panel__body {
  padding: 16px;
}
</style>
