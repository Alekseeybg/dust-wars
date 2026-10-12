<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore, LIMITS } from 'stores/game';
import { money } from 'utils/format';
import HeatMeter from './HeatMeter.vue';

const game = useGameStore();
const { cash, debt, day, heat, city } = storeToRefs(game);

const cashStr = computed(() => money(cash.value));
const debtStr = computed(() => money(debt.value));
</script>

<template>
  <q-header class="topbar">
    <div class="topbar__inner">
      <div class="brand">
        <span class="brand__name">Dust Wars</span>
        <span class="brand__sub">Street Edition</span>
      </div>

      <div class="topbar__stats">
        <div class="stat">
          <span class="stat__label">Cash</span>
          <span class="stat__value stat__value--gold mono">{{ cashStr }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">Debt</span>
          <span class="stat__value stat__value--wine mono">{{ debtStr }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">Day</span>
          <span class="stat__value mono">
            {{ day }}<span class="stat__of">/{{ LIMITS.MAX_DAYS }}</span>
          </span>
        </div>
        <div class="stat">
          <span class="stat__label">Location</span>
          <span class="stat__value">{{ city.name }}</span>
        </div>
        <HeatMeter :level="heat" :max="LIMITS.HEAT_MAX" />
      </div>
    </div>
  </q-header>
</template>

<style lang="scss" scoped>
.topbar {
  border-bottom: 1px solid var(--stroke);
  background: rgba(5, 5, 5, 0.82) !important;
  backdrop-filter: blur(10px);
}

.topbar__inner {
  display: flex;
  align-items: center;
  gap: var(--sp-6);
  max-width: 1500px;
  margin: 0 auto;
  padding: var(--sp-3) var(--sp-5);
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.brand__name {
  font-size: var(--fs-md);
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gold-soft);
}

.brand__sub {
  font-size: var(--fs-label);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted-2);
}

.topbar__stats {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--sp-7);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat__label {
  font-size: var(--fs-label);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
}

.stat__value {
  font-size: var(--fs-lg);
  font-weight: 600;
  line-height: 1;
  color: var(--text);
}

.stat__value--gold {
  color: var(--gold-soft);
}

.stat__value--wine {
  color: var(--wine-soft);
}

.stat__of {
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--muted-2);
}

@media (max-width: 900px) {
  .topbar__inner {
    flex-wrap: wrap;
    gap: var(--sp-5);
  }

  .topbar__stats {
    margin-left: 0;
    gap: var(--sp-5);
  }
}
</style>
