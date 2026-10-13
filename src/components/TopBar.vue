<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore, LIMITS } from 'stores/game'
import { money } from 'utils/format'
import HeatMeter from './HeatMeter.vue'

const game = useGameStore()
const { cash, debt, day, heat, city } = storeToRefs(game)

const cashStr = computed(() => money(cash.value))
const debtStr = computed(() => money(debt.value))
</script>

<template>
  <q-header class="topbar">
    <div class="topbar__inner">
      <router-link to="/market" class="brand" aria-label="Dust Wars — home">
        <span class="brand__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 2.5 L21.5 12 L12 21.5 L2.5 12 Z" fill="none" stroke="currentColor" stroke-width="1.4" />
            <path d="M12 7.5 L16.5 12 L12 16.5 L7.5 12 Z" fill="currentColor" opacity="0.5" />
          </svg>
        </span>
        <span class="brand__text">
          <span class="brand__name">Dust Wars</span>
          <span class="brand__sub">Street Edition</span>
        </span>
      </router-link>

      <div class="topbar__stats">
        <div class="stat">
          <span class="stat__label">Cash</span>
          <span class="stat__value stat__value--gold mono">{{ cashStr }}</span>
        </div>

        <span class="stat__sep" aria-hidden="true" />

        <div class="stat">
          <span class="stat__label">Debt</span>
          <span class="stat__value stat__value--wine mono">{{ debtStr }}</span>
        </div>

        <span class="stat__sep" aria-hidden="true" />

        <div class="stat">
          <span class="stat__label">Day</span>
          <span class="stat__value mono">
            {{ day }}<span class="stat__of">/{{ LIMITS.MAX_DAYS }}</span>
          </span>
        </div>

        <span class="stat__sep" aria-hidden="true" />

        <div class="stat">
          <span class="stat__label">Location</span>
          <span class="stat__value">{{ city.name }}</span>
        </div>

        <span class="stat__sep" aria-hidden="true" />

        <HeatMeter :level="heat" :max="LIMITS.HEAT_MAX" />
      </div>
    </div>
  </q-header>
</template>

<style lang="scss" scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background:
    /* warm light source behind the brand, bleeding rightward */
    radial-gradient(720px 140% at 0% 50%,
      rgba(184, 137, 63, .10) 0%,
      rgba(184, 137, 63, .04) 35%,
      transparent 72%),
    /* faint warm counterpoint from the far right edge */
    radial-gradient(380px 100% at 100% 50%,
      rgba(184, 137, 63, .035) 0%,
      transparent 70%),
    /* base vertical gradient — slightly warmer at top */
    linear-gradient(180deg,
      rgba(20, 17, 13, .96) 0%,
      rgba(11, 10, 9, .98) 55%,
      rgba(6, 6, 8, 1) 100%);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .035),
    0 1px 0 rgba(0, 0, 0, .55);
}

/* Gold hairline along the bottom, brightest at the brand side. */
.topbar::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg,
      rgba(184, 137, 63, .55) 0%,
      rgba(184, 137, 63, .22) 18%,
      rgba(184, 137, 63, .06) 45%,
      transparent 70%);
  pointer-events: none;
}

.topbar__inner {
  display: flex;
  align-items: center;
  /* brand cluster, then stats cluster with a fixed comfortable gap;
     no auto-margin — everything sits toward the left of the bar. */
  gap: 64px;
  padding: 16px 32px;
}

/* ---- brand -------------------------------------------------------- */

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  color: inherit;
  transition: opacity 160ms ease;
}

.brand:hover {
  opacity: .92;
}

.brand__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold);
  transition: color 160ms ease, filter 160ms ease;
}

.brand:hover .brand__mark {
  color: #e8bf76;
  filter: drop-shadow(0 0 10px rgba(212, 168, 96, .38));
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.brand__name {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: .30em;
  text-transform: uppercase;
  color: var(--gold-soft);
  line-height: 1.15;
}

.brand__sub {
  margin-top: 3px;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: .30em;
  text-transform: uppercase;
  color: var(--muted-2);
  line-height: 1;
}

/* ---- stats cluster ------------------------------------------------ */

.topbar__stats {
  display: flex;
  align-items: center;
  gap: 32px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat__label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--muted-2);
  line-height: 1;
}

.stat__value {
  font-size: 19px;
  font-weight: 600;
  line-height: 1.05;
  color: var(--text);
}

.stat__value--gold {
  color: var(--gold-soft);
}

.stat__value--wine {
  color: var(--wine-soft);
}

.stat__of {
  margin-left: 2px;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted-2);
}

.stat__sep {
  width: 1px;
  height: 26px;
  background: linear-gradient(180deg,
      transparent 0%,
      rgba(255, 255, 255, .08) 25%,
      rgba(255, 255, 255, .08) 75%,
      transparent 100%);
}

@media (max-width: 1100px) {
  .topbar__inner {
    flex-wrap: wrap;
    gap: 24px;
    padding: 14px 20px;
  }

  .topbar__stats {
    gap: 18px;
  }

  .stat__sep {
    display: none;
  }

  .stat__value {
    font-size: 17px;
  }
}
</style>
