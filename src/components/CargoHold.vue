<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from 'stores/game';
import type { DrugId } from 'types';
import Panel from './Panel.vue';
import CargoDialog from './CargoDialog.vue';

const game = useGameStore();
const { cargoGroups: items, cargoUsed: used, capacity } = storeToRefs(game);

const showDialog = ref(false);
const dialogFocusId = ref<DrugId | null>(null);

const pct = computed(() => Math.min(100, (used.value / capacity.value) * 100));
const warn = computed(() => pct.value >= 90);

function openDialog(drugId: DrugId | null = null) {
  if (items.value.length === 0) return;
  dialogFocusId.value = drugId;
  showDialog.value = true;
}
</script>

<template>
  <Panel title="Cargo Hold">
    <div class="capacity">
      <span class="capacity__label">Capacity</span>
      <span class="capacity__value mono">{{ used }} / {{ capacity }}</span>
    </div>

    <div class="bar" :class="{ 'bar--warn': warn }">
      <div class="bar__fill" :style="{ width: pct + '%' }" />
    </div>

    <ul v-if="items.length" class="cargo">
      <li v-for="item in items" :key="item.id" class="cargo__row" @click="openDialog(item.id)">
        <span class="cargo__name">
          <span class="cargo__swatch" :style="{ background: item.swatch }" />
          {{ item.name }}
        </span>
        <span class="cargo__qty mono">{{ item.total }}g</span>
      </li>
    </ul>
    <p v-else class="empty">Hold is empty.</p>

    <button v-if="items.length > 0" class="view-all" type="button" @click="openDialog(null)">
      View Details
    </button>

    <CargoDialog v-model="showDialog" :focus-drug-id="dialogFocusId" />
  </Panel>
</template>

<style lang="scss" scoped>
.capacity {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}

.capacity__label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted-2);
}

.capacity__value {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--text);
}

.bar {
  height: 5px;
  border-radius: 3px;
  background: var(--bg-inset);
  border: 1px solid var(--stroke);
  overflow: hidden;
}

.bar__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold-dim), var(--gold));
  transition: width var(--t-med);
}

.bar--warn .bar__fill {
  background: linear-gradient(90deg, var(--wine), var(--wine-soft));
}

.cargo {
  margin-top: var(--sp-4);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cargo__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px;
  margin: 0 -6px;
  font-size: var(--fs-md);
  border-radius: 5px;
  cursor: pointer;
  transition: background 120ms ease;
}

.cargo__row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.cargo__name {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
}

.cargo__swatch {
  display: inline-block;
  width: 3px;
  height: 14px;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
}

.cargo__qty {
  color: var(--gold-soft);
}

.empty {
  color: var(--muted-2);
  font-size: var(--fs-sm);
  margin-top: var(--sp-3);
}

.view-all {
  display: block;
  width: 100%;
  margin-top: var(--sp-4);
  padding: 8px 12px;
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-align: center;
  color: var(--muted);
  background: transparent;
  border: 1px solid var(--stroke);
  border-radius: 5px;
  cursor: pointer;
  transition:
    color 120ms ease,
    background 120ms ease,
    border-color 120ms ease;
}

.view-all:hover {
  color: var(--gold-soft);
  background: rgba(184, 137, 63, 0.06);
  border-color: rgba(184, 137, 63, 0.28);
}
</style>
