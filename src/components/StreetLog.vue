<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from 'stores/game';
import Panel from './Panel.vue';
import SectionHeading from './SectionHeading.vue';
import LogDialog from './LogDialog.vue';
import LogFeed from './log/LogFeed.vue';
import type { LogFilter } from './log/types';

const { log } = storeToRefs(useGameStore());
const showDialog = ref(false);
const filter = ref<LogFilter>('all');
</script>

<template>
  <Panel class="street-log" title="Street Log">
    <template #header>
      <SectionHeading title="Street Log" subtitle="Latest activity">
        <template #action>
          <button
            class="section-action section-action--responsive"
            type="button"
            aria-label="Open full street log"
            title="Open full street log"
            @click="showDialog = true"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 3H3v10h10v-3M9 3h4v4M7 9l6-6" />
            </svg>
            <span>Full log</span>
          </button>
        </template>
      </SectionHeading>
    </template>
    <LogFeed v-model:filter="filter" :entries="log" :limit="5" />
    <LogDialog v-model="showDialog" v-model:filter="filter" />
  </Panel>
</template>

<style lang="scss" scoped>
.street-log {
  border-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: #0b0b0d;
}
:deep(.panel__head) {
  padding: 0;
  border-bottom-color: rgba(255, 255, 255, 0.1);
}
:deep(.panel__body) {
  padding: 0;
}
</style>
