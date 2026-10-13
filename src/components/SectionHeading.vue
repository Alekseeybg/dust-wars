<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; titleId?: string }>();
</script>

<template>
  <div class="section-heading">
    <div class="section-heading__titles">
      <h2 :id="titleId" class="section-heading__title">{{ title }}</h2>
      <span v-if="subtitle" class="section-heading__subtitle">
        <slot name="subtitle-icon" />
        {{ subtitle }}
      </span>
    </div>
    <div class="section-heading__action"><slot name="action" /></div>
  </div>
</template>

<style lang="scss" scoped>
.section-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 86px;
  padding: 16px 18px;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.055), transparent 68%),
    linear-gradient(180deg, #1b1b1d, #121214 60%, #0b0b0d);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.07),
    inset 0 -1px 0 rgba(0, 0, 0, 0.5);
}
.section-heading__titles {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  text-align: center;
}
.section-heading__title {
  margin: 0;
  padding-left: 0.16em;
  color: #efb34f;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.16em;
  line-height: 1.1;
  text-transform: uppercase;
}
.section-heading__subtitle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #a6a6ad;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
}
.section-heading__action {
  grid-column: 3;
  justify-self: end;
}
@media (max-width: 520px) {
  .section-heading {
    gap: 8px;
    padding-inline: 12px;
  }
}
</style>
