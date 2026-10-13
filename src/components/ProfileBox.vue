<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from 'stores/game';
import type { GamePhase } from 'types';
import Panel from './Panel.vue';
import SectionHeading from './SectionHeading.vue';

const game = useGameStore();
const { health, phase } = storeToRefs(game);

/**
 * Coarse status derived from health. Will expand once we have bleeding,
 * illness, and other conditions — at that point this becomes a computed
 * reading a `conditions` array from state, and health is only one input.
 */
const healthStatus = computed(() => {
  const pct = health.value.current / health.value.max;
  if (pct >= 0.99) return { label: 'Healthy', className: 'status--ok' };
  if (pct >= 0.7) return { label: 'Battered', className: 'status--warn' };
  if (pct >= 0.4) return { label: 'Wounded', className: 'status--warn' };
  if (pct >= 0.15) return { label: 'Critical', className: 'status--bad' };
  return { label: 'Dying', className: 'status--bad' };
});

const phaseLabels: Record<GamePhase, string> = {
  survival: 'Survival',
  building: 'Building',
  kingpin: 'Kingpin',
  endgame: 'Endgame',
};
</script>

<template>
  <Panel class="profile-box" title="Profile" variant="sidebar">
    <template #header><SectionHeading title="Profile" subtitle="Player overview" /></template>
    <dl class="profile-stats">
      <div class="profile-stats__health">
        <dt>Health</dt>
        <dd class="mono">
          {{ health.current }}<span> / {{ health.max }}</span>
        </dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd :class="healthStatus.className">{{ healthStatus.label }}</dd>
      </div>
      <div>
        <dt>Phase</dt>
        <dd>{{ phaseLabels[phase] }}</dd>
      </div>
      <div>
        <dt>Weapon</dt>
        <dd class="profile-stats__muted">Unarmed</dd>
      </div>
    </dl>
    <button class="section-action section-action--block" type="button" disabled>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M5 7V5a3 3 0 0 1 6 0v2M4 7h8v6H4zM8 9v2" />
      </svg>
      Full profile · Coming soon
    </button>
  </Panel>
</template>

<style lang="scss" scoped>
.profile-stats {
  margin: 0 0 14px;
}
.profile-stats > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
}
.profile-stats dt {
  color: #a6a6ad;
  font-size: 13px;
}
.profile-stats dd {
  margin: 0;
  color: #e5e1d9;
  font-size: 15px;
  font-weight: 500;
  text-align: right;
}
.profile-stats .profile-stats__health {
  padding: 2px 0 14px;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.profile-stats__health dd {
  color: #efb34f;
  font-size: 20px;
  font-weight: 600;
}
.profile-stats__health dd span {
  color: #a6a6ad;
  font-size: 14px;
  font-weight: 400;
}
.profile-stats dd.profile-stats__muted {
  color: #a6a6ad;
}
.profile-stats dd.status--ok {
  color: #a7ba80;
}
.profile-stats dd.status--warn {
  color: #efb34f;
}
.profile-stats dd.status--bad {
  color: #e45b54;
}
</style>
