<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from 'stores/game';
import type { DrugId } from 'types';
import Panel from './Panel.vue';
import SectionHeading from './SectionHeading.vue';
import CargoDialog from './CargoDialog.vue';
import CargoCapacity from './cargo/CargoCapacity.vue';
import CargoLabel from './cargo/CargoLabel.vue';
import CargoEmpty from './cargo/CargoEmpty.vue';

const { cargoGroups: items, cargoUsed: used, capacity } = storeToRefs(useGameStore());
const showDialog = ref(false);
const dialogFocusId = ref<DrugId | null>(null);

function openDialog(drugId: DrugId | null = null) {
  if (items.value.length === 0) return;
  dialogFocusId.value = drugId;
  showDialog.value = true;
}
</script>

<template>
  <Panel class="cargo-hold" title="Cargo Hold" variant="sidebar">
    <template #header>
      <SectionHeading title="Cargo Hold" subtitle="Inventory" />
    </template>

    <CargoCapacity :used="used" :capacity="capacity" />

    <ul v-if="items.length" class="cargo dust-scroll dust-scroll--neutral">
      <li v-for="item in items" :key="item.id">
        <button
          class="cargo__row"
          type="button"
          :aria-label="`View ${item.name} purchase details, ${item.total} grams`"
          @click="openDialog(item.id)"
        >
          <CargoLabel :name="item.name" :swatch="item.swatch" />
          <span class="cargo__qty mono">{{ item.total }}<span class="cargo__unit">g</span></span>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
        </button>
      </li>
    </ul>
    <CargoEmpty v-else />

    <button
      v-if="items.length"
      class="section-action cargo-hold__details"
      type="button"
      @click="openDialog()"
    >
      View details
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3H3v10h10v-3M9 3h4v4M7 9l6-6" /></svg>
    </button>

    <CargoDialog v-model="showDialog" :focus-drug-id="dialogFocusId" />
  </Panel>
</template>

<style lang="scss" scoped>
.cargo {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 282px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}
.cargo__row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  padding: 9px 11px;
  text-align: left;
  font-family: var(--sans);
  background: #131315;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  transition: background var(--t-fast);
}
.cargo__row :deep(.cargo-label) {
  flex: 1;
}
.cargo__row:hover {
  background: #19191c;
}
.cargo__row:focus-visible {
  outline: 2px solid #a6a6ad;
  outline-offset: -2px;
}
.cargo__qty {
  color: #efb34f;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
}
.cargo__unit {
  margin-left: 3px;
  color: #929299;
  font-size: 10px;
  font-weight: 400;
}
.cargo__row svg {
  flex: 0 0 12px;
  width: 12px;
  height: 12px;
  fill: none;
  stroke: #929299;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.3;
}
.cargo-hold__details {
  width: 100%;
  min-height: 38px;
  margin-top: 14px;
  font-size: 10px;
}
@media (prefers-reduced-motion: reduce) {
  .cargo__row {
    transition: none;
  }
}
</style>
