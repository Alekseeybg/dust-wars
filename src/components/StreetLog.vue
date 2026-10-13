<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from 'stores/game';
import Panel from './Panel.vue';
import LogDialog from './LogDialog.vue';
import LogEntries from './LogEntries.vue';

const game = useGameStore();
const { log } = storeToRefs(game);

const showDialog = ref(false);

/** Show the most recent 5 entries, newest first. */
const recent = computed(() => log.value.slice(-5).reverse());

function openDialog() {
  showDialog.value = true;
}
</script>

<template>
  <Panel title="Street Log">
    <template #action>
      <button class="panel-action" type="button" @click="openDialog">Full Log</button>
    </template>

    <LogEntries :entries="recent" compact />

    <LogDialog v-model="showDialog" />
  </Panel>
</template>
