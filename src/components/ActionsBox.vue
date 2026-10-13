<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Notify } from 'quasar';
import { useGameStore } from 'stores/game';
import Panel from './Panel.vue';

const game = useGameStore();
const { city, day } = storeToRefs(game);

function openMap() {
  Notify.create({
    type: 'info',
    message: 'Travel map coming soon.',
  });
}

function nextDay() {
  game.advanceDay(1);
  Notify.create({
    type: 'info',
    message: `Day ${day.value}`,
    timeout: 1100,
  });
}
</script>

<template>
  <Panel title="Actions">
    <div class="current">
      <span class="current__label">Currently in</span>
      <span class="current__city">{{ city.name }}</span>
    </div>

    <div class="actions">
      <button class="btn btn--block btn--lg" type="button" @click="openMap">
        <span>Travel</span>
        <span class="btn__value mono">→</span>
      </button>
      <button class="btn btn--block btn--lg" type="button" @click="nextDay">
        <span>Next Day</span>
        <span class="btn__value mono">+1</span>
      </button>
    </div>
  </Panel>
</template>

<style lang="scss" scoped>
.current {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--stroke);
}

.current__label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted-2);
}

.current__city {
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--gold-soft);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
