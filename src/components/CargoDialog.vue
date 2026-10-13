<script setup lang="ts">
import { onScopeDispose, ref, useTemplateRef, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from 'stores/game';
import type { DrugId } from 'types';
import { money } from 'utils/format';
import BaseDialog from './BaseDialog.vue';
import SectionHeading from './SectionHeading.vue';
import DayBadge from './DayBadge.vue';
import CargoCapacity from './cargo/CargoCapacity.vue';
import CargoLabel from './cargo/CargoLabel.vue';
import CargoEmpty from './cargo/CargoEmpty.vue';

const show = defineModel<boolean>({ required: true });
const props = defineProps<{ focusDrugId?: DrugId | null }>();
const { cargoGroups: groups, cargoUsed: used, capacity } = storeToRefs(useGameStore());
const dialog = useTemplateRef<InstanceType<typeof BaseDialog>>('dialog');
const details = useTemplateRef<HTMLElement>('details');
const sweepDrugId = ref<DrugId | null>(null);
let sweepObserver: IntersectionObserver | undefined;

function stopObservingSweep() {
  sweepObserver?.disconnect();
  sweepObserver = undefined;
}

watch(show, (visible) => {
  if (!visible) {
    stopObservingSweep();
    sweepDrugId.value = null;
  }
});
onScopeDispose(stopObservingSweep);

// Position the selected drug after the dialog's opening transition.
function focusDrug() {
  const drugId = props.focusDrugId;
  if (!drugId) return;

  const selector = `[data-drug-id="${drugId}"]`;
  const heading = details.value?.querySelector<HTMLElement>(`${selector} .group__head`);
  const scrollBody = details.value?.parentElement;
  const summaryHeight =
    details.value?.querySelector('.cargo-details__summary')?.getBoundingClientRect().height ?? 0;
  stopObservingSweep();

  // Start the light sweep once the heading is visible below the sticky capacity summary.
  if (heading && scrollBody && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sweepObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.intersectionRatio === 1 && show.value) {
          sweepDrugId.value = drugId;
          stopObservingSweep();
        }
      },
      { root: scrollBody, rootMargin: `-${summaryHeight}px 0px 0px 0px`, threshold: 1 },
    );
    sweepObserver.observe(heading);
  }

  dialog.value?.scrollTo(selector);
}
</script>

<template>
  <BaseDialog ref="dialog" v-model="show" title="Cargo Hold" variant="cargo" @show="focusDrug">
    <template #header="{ titleId }">
      <SectionHeading :title-id="titleId" title="Cargo Hold" subtitle="Purchase details">
        <template #action>
          <button
            class="section-action section-action--icon"
            type="button"
            aria-label="Close Cargo Hold"
            @click="show = false"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" /></svg>
          </button>
        </template>
      </SectionHeading>
    </template>

    <div ref="details" class="cargo-details">
      <div class="cargo-details__summary">
        <CargoCapacity :used="used" :capacity="capacity" />
      </div>
      <div class="cargo-details__groups">
        <CargoEmpty v-if="!groups.length" />

        <section
          v-for="group in groups"
          :key="group.id"
          class="group"
          :class="{
            'group--selected': group.id === focusDrugId,
            'group--sweep': group.id === sweepDrugId,
          }"
          :data-drug-id="group.id"
          @animationend.self="sweepDrugId = null"
        >
          <header class="group__head">
            <div class="group__identity">
              <h3 class="group__name"><CargoLabel :name="group.name" :swatch="group.swatch" /></h3>
              <span class="group__meta"
                >{{ group.lots.length }}
                {{ group.lots.length === 1 ? 'purchase' : 'purchases' }}</span
              >
            </div>
            <dl class="group__summary">
              <div class="group__metric">
                <dt>Quantity</dt>
                <dd class="group__value group__total mono">{{ group.total }}<span>g</span></dd>
              </div>
              <div class="group__metric">
                <dt>Cost</dt>
                <dd class="group__value group__cost">
                  <strong class="mono">{{ money(group.totalCost) }}</strong>
                </dd>
              </div>
            </dl>
          </header>

          <ul class="lots" :aria-label="`${group.name} purchase lots`">
            <li v-for="(lot, i) in group.lots" :key="i" class="lot">
              <DayBadge :day="lot.day" size="regular" />
              <span class="lot__price">
                <span class="lot__context">at </span><span class="mono">{{ money(lot.price) }}</span
                ><span class="lot__unit">/g</span>
              </span>
              <span class="lot__quantity">
                <strong class="mono">{{ lot.qty }}</strong
                ><span class="lot__unit">g</span>
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </BaseDialog>
</template>

<style lang="scss" scoped>
.cargo-details__summary {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 12px 16px;
  background: #0b0b0d;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.cargo-details__groups {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
}
.group {
  position: relative;
  isolation: isolate;
  flex-shrink: 0;
  overflow: hidden;
  background: #111113;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9px;
  scroll-margin-top: 128px;
}
.group--selected {
  border-color: rgba(239, 179, 79, 0.3);
}

.group--sweep::after {
  position: absolute;
  inset: -25% auto -25% -40%;
  z-index: 1;
  width: 35%;
  content: '';
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
  pointer-events: none;
  animation: cargo-section-sweep 650ms cubic-bezier(0.2, 0.6, 0.2, 1) both;
}

@keyframes cargo-section-sweep {
  from {
    opacity: 0;
    transform: translateX(0) skewX(-18deg);
  }
  15%,
  80% {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: translateX(430%) skewX(-18deg);
  }
}
.group__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #111113;
}

@media (prefers-reduced-motion: reduce) {
  .group--sweep::after {
    animation: none;
  }
}
.group__identity {
  display: flex;
  flex: 1 1 100px;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.group__name {
  margin: 0;
  font: inherit;
}
.group__meta {
  padding-left: 18px;
  color: #a6a6ad;
  font-size: 13px;
  line-height: 1.4;
}
.group__value {
  margin: 0;
  color: #efb34f;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
.group__total span {
  margin-left: 4px;
  color: #a6a6ad;
  font-size: 14px;
  font-weight: 400;
}
.group__summary {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  min-width: 0;
  margin: 0 0 0 auto;
  padding: 9px 12px;
  background: #0c0c0e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
}
.group__metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.group__metric + .group__metric {
  margin-left: 14px;
  padding-left: 14px;
  border-left: 1px solid rgba(255, 255, 255, 0.09);
}
.group__metric dt {
  color: #a6a6ad;
  font-size: 13px;
  line-height: 1.3;
}
.group__cost strong {
  font-size: inherit;
  font-weight: inherit;
}
.lots {
  margin: 0 14px;
  padding: 4px 0;
  list-style: none;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}
.lot {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  min-height: 58px;
  padding: 12px 0;
  color: #e5e1d9;
  font-size: 16px;
  line-height: 1.4;
}
.lot + .lot {
  border-top: 1px solid rgba(255, 255, 255, 0.045);
}
.lot__price {
  color: #efb34f;
  overflow-wrap: anywhere;
}
.lot__context,
.lot__unit {
  color: #a6a6ad;
  font-size: 14px;
}
.lot__quantity {
  text-align: right;
}
.lot__quantity strong {
  font-weight: 500;
}
.lot__quantity .lot__unit {
  margin-left: 3px;
}
@media (max-width: 520px) {
  .cargo-details__summary {
    padding-inline: 12px;
  }
  .cargo-details__groups {
    padding: 12px;
  }
  .group__head {
    padding: 12px;
  }
  .lots {
    margin-inline: 12px;
  }
  .lot {
    gap: 10px;
  }
}
</style>
