<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Notify } from 'quasar'
import { useGameStore } from 'stores/game'
import Panel from './Panel.vue'

const game = useGameStore()
const { health, phase } = storeToRefs(game)

/**
 * Coarse status derived from health. Will expand once we have bleeding,
 * illness, and other conditions — at that point this becomes a computed
 * reading a `conditions` array from state, and health is only one input.
 */
const status = computed(() => {
  const pct = health.value.current / health.value.max
  if (pct >= 0.99) return 'Healthy'
  if (pct >= 0.7) return 'Battered'
  if (pct >= 0.4) return 'Wounded'
  if (pct >= 0.15) return 'Critical'
  return 'Dying'
})

const statusClass = computed(() => {
  const pct = health.value.current / health.value.max
  if (pct >= 0.99) return 'status--ok'
  if (pct >= 0.4) return 'status--warn'
  return 'status--bad'
})

const phaseLabel = computed(() => {
  const map: Record<string, string> = {
    survival: 'Survival',
    building: 'Building',
    kingpin: 'Kingpin',
    endgame: 'Endgame',
  }
  return map[phase.value] ?? phase.value
})

function openProfile() {
  Notify.create({
    type: 'info',
    message: 'Profile screen coming soon.',
  })
}
</script>

<template>
  <Panel title="Profile">
    <div class="rows">
      <div class="row">
        <span class="row__label">Health</span>
        <span class="row__value mono">{{ health.current }} / {{ health.max }}</span>
      </div>
      <div class="row">
        <span class="row__label">Status</span>
        <span class="row__value" :class="statusClass">{{ status }}</span>
      </div>
      <div class="row">
        <span class="row__label">Phase</span>
        <span class="row__value">{{ phaseLabel }}</span>
      </div>
      <div class="row">
        <span class="row__label">Weapon</span>
        <span class="row__value row__value--muted">Unarmed</span>
      </div>
    </div>

    <button class="btn btn--block profile-btn" type="button" @click="openProfile">
      Open Profile
    </button>
  </Panel>
</template>

<style lang="scss" scoped>
.rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: var(--fs-sm);
}

.row__label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--muted-2);
}

.row__value {
  color: var(--text);
  font-weight: 500;
}

.row__value--muted {
  color: var(--muted);
}

.status--ok {
  color: var(--forest-soft);
}

.status--warn {
  color: var(--gold-soft);
}

.status--bad {
  color: var(--wine-soft);
}

.profile-btn {
  margin-top: 4px;
}
</style>
