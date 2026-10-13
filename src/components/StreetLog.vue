<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from 'stores/game'
import Panel from './Panel.vue'
import LogDialog from './LogDialog.vue'

const game = useGameStore()
const { log } = storeToRefs(game)

const showDialog = ref(false)

/** Show the most recent 5 entries, newest first. */
const recent = computed(() => [...log.value].slice(-5).reverse())

function openDialog() {
  showDialog.value = true
}
</script>

<template>
  <Panel title="Street Log">
    <template #action>
      <button class="view-all" type="button" @click="openDialog">
        Full Log
      </button>
    </template>

    <ol class="log">
      <li v-for="(entry, i) in recent" :key="`${entry.day}-${i}`" class="log__row">
        <span class="log__day mono">D{{ entry.day }}</span>
        <span class="log__text">
          <span v-for="(segment, j) in entry.segments" :key="j" class="log__seg"
            :class="{ 'log__seg--bold': segment.bold }"
            :style="segment.color ? { color: `var(--${segment.color})` } : undefined">{{ segment.text }}</span>
        </span>
      </li>
    </ol>

    <LogDialog v-model="showDialog" />
  </Panel>
</template>

<style lang="scss" scoped>
.view-all {
  padding: 4px 8px;
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: color 120ms ease, background 120ms ease, border-color 120ms ease;
  white-space: nowrap;
}

.view-all:hover {
  color: var(--gold-soft);
  background: rgba(184, 137, 63, .08);
  border-color: rgba(184, 137, 63, .18);
}

.log {
  display: flex;
  flex-direction: column;
}

.log__row {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 14px;
  padding: 10px 0;
  font-size: 15px;
  line-height: 1.55;
  border-bottom: 1px solid var(--stroke);
}

.log__row:last-child {
  border-bottom: none;
}

.log__day {
  padding-top: 3px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .10em;
  color: var(--muted-2);
}

.log__text {
  color: var(--text);
}

.log__seg--bold {
  font-weight: 700;
}
</style>
