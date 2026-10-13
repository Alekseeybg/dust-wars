<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { QDialog } from 'quasar'
import { useGameStore } from 'stores/game'
import { getDrug } from 'data/drugs'
import type { CargoLot, DrugId } from 'types'
import { money } from 'utils/format'

const show = defineModel<boolean>({ required: true })
const props = defineProps<{
  /** If set, the dialog scrolls to this drug's section on open. */
  focusDrugId?: DrugId | null
}>()

const game = useGameStore()
const { cargoLots, capacity } = storeToRefs(game)

const bodyRef = ref<HTMLElement | null>(null)

interface DrugGroup {
  id: DrugId
  name: string
  swatch: string
  total: number
  lots: CargoLot[]
}

const groups = computed<DrugGroup[]>(() => {
  const rows: DrugGroup[] = []
  for (const [id, lots] of Object.entries(cargoLots.value)) {
    if (!lots || lots.length === 0) continue
    const drugId = id as DrugId
    const drug = getDrug(drugId)
    let total = 0
    for (const lot of lots) total += lot.qty
    rows.push({ id: drugId, name: drug.name, swatch: drug.swatch, total, lots })
  }
  return rows
})

const used = computed(() => game.cargoUsed)

function close() {
  show.value = false
}

/**
 * On open: if a focus drug was passed, scroll its section into view.
 * Delayed slightly so the dialog's own open transition settles first —
 * a scroll started mid-animation lands at the wrong offset.
 */
watch(show, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  const target = props.focusDrugId
  if (!target || !bodyRef.value) return

  setTimeout(() => {
    if (!bodyRef.value) return
    const el = bodyRef.value.querySelector<HTMLElement>(
      `[data-drug-id="${target}"]`,
    )
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 180)
})
</script>

<template>
  <QDialog v-model="show">
    <div class="dust-dialog dust-dialog--cargo">
      <header class="dust-dialog__head">
        <div class="dust-dialog__titles">
          <h2 class="dust-dialog__title">Cargo Hold</h2>
          <span class="dust-dialog__sub mono">{{ used }} / {{ capacity }} used</span>
        </div>
        <button class="dust-dialog__close" type="button" aria-label="Close" @click="close">×</button>
      </header>

      <div ref="bodyRef" class="dust-dialog__body dust-scroll">
        <div v-if="groups.length === 0" class="dust-dialog__empty">
          Your hold is empty.
        </div>

        <section v-for="group in groups" :key="group.id" class="group" :data-drug-id="group.id">
          <header class="group__head">
            <span class="group__swatch" :style="{ background: group.swatch }" />
            <span class="group__name">{{ group.name }}</span>
            <span class="group__total mono">{{ group.total }}g</span>
          </header>

          <ul class="lots">
            <li v-for="(lot, i) in group.lots" :key="i" class="lot">
              <span class="lot__qty mono">{{ lot.qty }}g</span>
              <span class="lot__sep">at</span>
              <span class="lot__price mono">{{ money(lot.price) }}</span>
              <span class="lot__sep lot__sep--day">day</span>
              <span class="lot__day mono">D{{ lot.day }}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </QDialog>
</template>

<style lang="scss" scoped>
/* scroll-margin-top gives the target section breathing room above its
   header when scrollIntoView aligns it to the top of the container.
   Without this, the header sits flush against the container's top edge
   and can look cropped. */
.group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  scroll-margin-top: 12px;
}

.group__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--stroke);
}

.group__swatch {
  width: 4px;
  height: 18px;
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, .25);
}

.group__name {
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: .01em;
}

.group__total {
  font-size: 17px;
  font-weight: 700;
  color: var(--gold-soft);
}

.lots {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lot {
  display: grid;
  grid-template-columns: 64px 24px 1fr 32px auto;
  align-items: baseline;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, .015);
  border: 1px solid var(--stroke);
}

.lot__qty {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  text-align: right;
}

.lot__sep {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--muted-2);
  text-align: center;
}

.lot__price {
  font-size: 15px;
  font-weight: 600;
  color: var(--gold-soft);
}

.lot__day {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  text-align: right;
}
</style>
