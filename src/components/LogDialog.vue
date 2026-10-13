<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { QDialog } from 'quasar'
import { useGameStore } from 'stores/game'

const show = defineModel<boolean>({ required: true })

const game = useGameStore()
const { log } = storeToRefs(game)

const entries = computed(() => [...log.value].reverse())

function close() {
  show.value = false
}
</script>

<template>
  <QDialog v-model="show">
    <div class="dust-dialog dust-dialog--log">
      <header class="dust-dialog__head">
        <div class="dust-dialog__titles">
          <h2 class="dust-dialog__title">Street Log</h2>
          <span class="dust-dialog__sub mono">{{ log.length }} entries</span>
        </div>
        <button class="dust-dialog__close" type="button" aria-label="Close" @click="close">×</button>
      </header>

      <div class="dust-dialog__body dust-scroll">
        <div v-if="entries.length === 0" class="dust-dialog__empty">
          Nothing has happened yet.
        </div>

        <ol v-else class="entries">
          <li v-for="(entry, i) in entries" :key="i" class="entry">
            <span class="entry__day mono">D{{ entry.day }}</span>
            <span class="entry__text">
              <span v-for="(segment, j) in entry.segments" :key="j" :class="{ 'entry__seg--bold': segment.bold }"
                :style="segment.color ? { color: `var(--${segment.color})` } : undefined">{{ segment.text }}</span>
            </span>
          </li>
        </ol>
      </div>
    </div>
  </QDialog>
</template>

<style lang="scss" scoped>
.entries {
  display: flex;
  flex-direction: column;
}

.entry {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 14px;
  padding: 10px 0;
  font-size: 14px;
  line-height: 1.55;
  border-bottom: 1px solid var(--stroke);
}

.entry:last-child {
  border-bottom: none;
}

.entry__day {
  padding-top: 2px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .10em;
  color: var(--muted-2);
}

.entry__text {
  color: var(--text);
}

.entry__seg--bold {
  font-weight: 700;
}
</style>
