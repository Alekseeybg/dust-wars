<script setup lang="ts">
import Panel from 'components/Panel.vue';
</script>

<template>
  <Panel title="Bank">
    <div class="stub">
      <p class="stub__title">Bank screen</p>
      <p class="stub__sub">Not yet built.</p>
    </div>
  </Panel>
</template>

<style lang="scss" scoped>
.stub {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-8) var(--sp-5);
  text-align: center;
}
.stub__title {
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--muted);
}
.stub__sub {
  font-size: var(--fs-sm);
  color: var(--muted-2);
  max-width: 42ch;
}
</style>
