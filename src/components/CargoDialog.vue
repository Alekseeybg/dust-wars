<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from 'stores/game';
import type { DrugId } from 'types';
import { money } from 'utils/format';
import BaseDialog from './BaseDialog.vue';

const show = defineModel<boolean>({ required: true });
const props = defineProps<{ focusDrugId?: DrugId | null }>();
const game = useGameStore();
const { cargoGroups: groups, cargoUsed: used, capacity } = storeToRefs(game);
const dialog = useTemplateRef<InstanceType<typeof BaseDialog>>('dialog');

// QDialog emits show after its opening transition, so no timer is needed.
function focusDrug() {
  if (props.focusDrugId) dialog.value?.scrollTo(`[data-drug-id="${props.focusDrugId}"]`);
}
</script>

<template>
  <BaseDialog
    ref="dialog"
    v-model="show"
    title="Cargo Hold"
    variant="cargo"
    :subtitle="`${used} / ${capacity} used`"
    @show="focusDrug"
  >
    <div v-if="groups.length === 0" class="dust-dialog__empty">Your hold is empty.</div>

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
  </BaseDialog>
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
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
}

.group__name {
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.01em;
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
  background: rgba(255, 255, 255, 0.015);
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
  letter-spacing: 0.14em;
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
