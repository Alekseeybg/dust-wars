<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from 'stores/game';
import Panel from './Panel.vue';

const game = useGameStore();
const { log } = storeToRefs(game);

const recent = computed(() => [...log.value].slice(-5).reverse());
</script>

<template>
  <Panel title="Street Log">
    <ul class="log">
      <li v-for="(entry, i) in recent" :key="i" class="log__row" :class="`log__row--${entry.kind}`">
        <span class="log__day mono">D{{ entry.day }}</span>
        <span class="log__text">{{ entry.text }}</span>
      </li>
    </ul>
    <router-link to="/log" class="log__more">View full log →</router-link>
  </Panel>
</template>

<style lang="scss" scoped>
.log {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.log__row {
  display: flex;
  gap: 10px;
  font-size: var(--fs-sm);
  line-height: 1.45;
}
.log__day {
  color: var(--muted-2);
  flex-shrink: 0;
}
.log__row--good .log__text {
  color: var(--forest-soft);
}
.log__row--bad .log__text {
  color: var(--wine-soft);
}
.log__more {
  display: inline-block;
  margin-top: 14px;
  font-size: var(--fs-xs);
  letter-spacing: 0.08em;
  color: var(--muted);
  text-decoration: none;
  transition: color var(--t-fast);
}
.log__more:hover {
  color: var(--gold-soft);
}
</style>
