<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from 'stores/game';
import BaseDialog from './BaseDialog.vue';
import SectionHeading from './SectionHeading.vue';
import LogFeed from './log/LogFeed.vue';
import type { LogFilter } from './log/types';
import { useLogFeed } from './log/useLogFeed';

const show = defineModel<boolean>({ required: true });
const filter = defineModel<LogFilter>('filter', { default: 'all' });
const { log } = storeToRefs(useGameStore());
const { counts } = useLogFeed(log, filter);
const countLabel = computed(() => {
  const count = counts.value[filter.value];
  if (filter.value === 'all') return `${count} ${count === 1 ? 'entry' : 'entries'}`;
  return `${count} ${filter.value}${count === 1 ? '' : 's'}`;
});
const dialog = ref<InstanceType<typeof BaseDialog>>();
watch(filter, () => dialog.value?.scrollToTop(), { flush: 'post' });
</script>

<template>
  <BaseDialog ref="dialog" v-model="show" title="Street Log" variant="log">
    <template #header="{ titleId }">
      <SectionHeading :title-id="titleId" title="Street Log" :subtitle="countLabel">
        <template #action>
          <button
            class="section-action section-action--icon"
            type="button"
            aria-label="Close Street Log"
            @click="show = false"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" /></svg>
          </button>
        </template>
      </SectionHeading>
    </template>
    <LogFeed v-model:filter="filter" :entries="log" />
  </BaseDialog>
</template>
