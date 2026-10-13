<script setup lang="ts">
import { ref, useId } from 'vue';
import { QDialog } from 'quasar';

const show = defineModel<boolean>({ required: true });
defineProps<{ title: string; subtitle?: string; variant: 'cargo' | 'log' }>();
const emit = defineEmits<{ show: [] }>();
const titleId = useId();
const bodyRef = ref<HTMLElement | null>(null);

function scrollTo(selector: string) {
  bodyRef.value?.querySelector<HTMLElement>(selector)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}
defineExpose({ scrollTo });
</script>

<template>
  <QDialog v-model="show" @show="emit('show')">
    <div class="dust-dialog" :class="`dust-dialog--${variant}`" :aria-labelledby="titleId">
      <header class="dust-dialog__head">
        <div class="dust-dialog__titles">
          <h2 :id="titleId" class="dust-dialog__title">{{ title }}</h2>
          <span v-if="subtitle" class="dust-dialog__sub mono">{{ subtitle }}</span>
        </div>
        <button
          class="dust-dialog__close"
          type="button"
          :aria-label="`Close ${title}`"
          @click="show = false"
        >
          ×
        </button>
      </header>
      <div ref="bodyRef" class="dust-dialog__body dust-scroll"><slot /></div>
    </div>
  </QDialog>
</template>
