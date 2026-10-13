<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from 'stores/game'
import { getDrug } from 'data/drugs'
import type { DrugId } from 'types'
import Panel from './Panel.vue'

const game = useGameStore()
const { cargo, capacity } = storeToRefs(game)

const used = computed(() => game.cargoUsed)
const pct = computed(() => Math.min(100, (used.value / capacity.value) * 100))
const warn = computed(() => pct.value >= 90)

interface CargoRow {
  id: DrugId
  name: string
  qty: number
}

const items = computed<CargoRow[]>(() => {
  const rows: CargoRow[] = []
  for (const [id, qty] of Object.entries(cargo.value)) {
    if (qty == null || qty <= 0) continue
    const drugId = id as DrugId
    rows.push({ id: drugId, name: getDrug(drugId).name, qty })
  }
  return rows
})
</script>

<template>
  <Panel title="Cargo Hold" :meta="`${used} / ${capacity}`" meta-label="Capacity">
    <div class="bar" :class="{ 'bar--warn': warn }">
      <div class="bar__fill" :style="{ width: pct + '%' }" />
    </div>

    <ul v-if="items.length" class="cargo">
      <li v-for="item in items" :key="item.id" class="cargo__row">
        <span class="cargo__name">{{ item.name }}</span>
        <span class="cargo__qty mono">{{ item.qty }}</span>
      </li>
    </ul>
    <p v-else class="empty">Hold is empty.</p>
  </Panel>
</template>

<style lang="scss" scoped>
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
  gap: var(--sp-2);
}

.cargo__row {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-md);
}

.cargo__qty {
  color: var(--gold-soft);
}

.empty {
  color: var(--muted-2);
  font-size: var(--fs-sm);
  margin-top: var(--sp-3);
}
</style>
