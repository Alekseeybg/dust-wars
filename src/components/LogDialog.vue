<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from 'stores/game';
import BaseDialog from './BaseDialog.vue';
import LogEntries from './LogEntries.vue';

const show = defineModel<boolean>({ required: true });
const { log } = storeToRefs(useGameStore());
const entries = computed(() => [...log.value].reverse());
</script>

<template>
  <BaseDialog v-model="show" title="Street Log" variant="log" :subtitle="`${log.length} entries`">
    <div v-if="entries.length === 0" class="dust-dialog__empty">Nothing has happened yet.</div>
    <LogEntries v-else :entries="entries" />
  </BaseDialog>
</template>
