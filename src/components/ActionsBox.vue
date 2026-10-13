<script setup lang="ts">
import { computed, useId } from 'vue';
import { storeToRefs } from 'pinia';
import { Notify } from 'quasar';
import { useGameStore } from 'stores/game';
import Panel from './Panel.vue';
import SectionHeading from './SectionHeading.vue';
import { money } from 'utils/format';

const game = useGameStore();
const { city, day, cash, debt, maxDebtPayment } = storeToRefs(game);
const paymentHintId = useId();
const paymentHint = computed(() => {
  if (debt.value === 0) return 'Debt cleared. Keep what you earn.';
  if (cash.value < 1) return 'Earn some cash to repay your debt.';
  return maxDebtPayment.value === debt.value
    ? 'This payment clears your remaining debt.'
    : 'Repays as much as your available cash allows.';
});

function payDebt() {
  const result = game.payDebt();
  Notify.create({
    type: result.ok ? 'positive' : 'negative',
    message: result.ok
      ? `Paid ${money(result.paid)}${debt.value === 0 ? ' — debt cleared.' : ' toward debt.'}`
      : result.reason,
  });
}

function nextDay() {
  game.advanceDay(1);
  Notify.create({
    type: 'info',
    message: `Day ${day.value}`,
    timeout: 1100,
  });
}
</script>

<template>
  <Panel class="actions-box" title="Actions" variant="sidebar">
    <template #header><SectionHeading title="Actions" :subtitle="city.name" /></template>
    <div class="actions">
      <button class="section-action section-action--block actions__button" type="button" disabled>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="m2 4 4-2 4 2 4-2v10l-4 2-4-2-4 2zM6 2v10M10 4v10" />
        </svg>
        <span>Travel</span><span class="actions__meta">Coming soon</span>
      </button>
      <button
        class="section-action section-action--block actions__button"
        type="button"
        @click="nextDay"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 4h10v9H3zM5 2v4M11 2v4M3 7h10M8 9v2M7 10h2" />
        </svg>
        <span>Next Day</span>
        <span class="actions__meta mono">+1 day</span>
      </button>
    </div>
    <div class="debt-payment">
      <div class="debt-payment__balance" :class="{ 'debt-payment__balance--cleared': debt === 0 }">
        <span>Debt remaining</span><strong class="mono">{{ money(debt) }}</strong>
      </div>
      <button
        class="section-action section-action--block section-action--accent actions__button debt-payment__button"
        type="button"
        :disabled="maxDebtPayment === 0"
        :aria-describedby="paymentHintId"
        @click="payDebt"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 5h12v7H2zM2 7h12M5 10h2" /></svg>
        <span>{{ debt === 0 ? 'Debt cleared' : 'Pay debt' }}</span>
        <span v-if="maxDebtPayment > 0" class="actions__meta mono">{{
          money(maxDebtPayment)
        }}</span>
      </button>
      <p :id="paymentHintId" class="debt-payment__hint" aria-live="polite">{{ paymentHint }}</p>
    </div>
  </Panel>
</template>

<style lang="scss" scoped>
.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.actions__button {
  justify-content: flex-start;
  gap: 10px;
}
.actions__meta {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
}
.debt-payment {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.debt-payment__balance {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  color: #a6a6ad;
  font-size: 13px;
}
.debt-payment__balance strong {
  color: #e45b54;
  font-size: 17px;
  font-weight: 600;
}
.debt-payment__balance--cleared strong {
  color: #a7ba80;
}
.debt-payment__hint {
  margin: 10px 0 0;
  color: #a6a6ad;
  font-size: 12px;
  line-height: 1.5;
}
</style>
