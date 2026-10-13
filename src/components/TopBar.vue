<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { QHeader, QResizeObserver } from 'quasar';
import { useGameStore } from 'stores/game';
import { CONFIG } from 'data/config';
import { money } from 'utils/format';
import logoUrl from 'src/assets/dust-wars-mark.png';
import HeatMeter from './HeatMeter.vue';

const emit = defineEmits<{ resize: [height: number] }>();
const { cash, debt, day, heat, city } = storeToRefs(useGameStore());
const cashLabel = computed(() => money(cash.value));
const debtLabel = computed(() => money(debt.value));

function updateHeight({ height }: { height: number }) {
  emit('resize', height);
}
</script>

<template>
  <QHeader class="topbar">
    <QResizeObserver @resize="updateHeight" />

    <div class="topbar__frame">
      <div class="topbar__inner">
        <router-link
          to="/market"
          class="brand"
          aria-label="Dust Wars — home"
          aria-current-value="false"
        >
          <span class="brand__seal">
            <img class="brand__mark" :src="logoUrl" alt="" width="56" height="56" />
          </span>
          <span class="brand__text">
            <span class="brand__name">Dust Wars</span>
            <span class="brand__sub">Street Edition</span>
          </span>
        </router-link>

        <dl class="topbar__stats">
          <div class="stat">
            <dt class="stat__label">Cash</dt>
            <dd class="stat__value stat__value--gold mono" :title="cashLabel">{{ cashLabel }}</dd>
          </div>
          <div class="stat">
            <dt class="stat__label">Debt</dt>
            <dd class="stat__value stat__value--wine mono" :title="debtLabel">{{ debtLabel }}</dd>
          </div>
          <div class="stat">
            <dt class="stat__label">Day</dt>
            <dd class="stat__value mono">
              {{ day }}<span class="stat__of"> / {{ CONFIG.MAX_DAYS }}</span>
            </dd>
          </div>
          <div class="stat stat--location">
            <dt class="stat__label">Location</dt>
            <dd class="stat__value stat__value--location" :title="city.name">{{ city.name }}</dd>
          </div>
          <div class="stat stat--heat">
            <dt class="sr-only">Heat</dt>
            <dd><HeatMeter :level="heat" :max="CONFIG.HEAT_MAX" /></dd>
          </div>
        </dl>
      </div>

      <div class="topbar__nav-wrap">
        <nav class="topbar__nav" aria-label="Primary navigation">
          <router-link to="/market" class="nav-item" exact-active-class="is-active"
            >Market</router-link
          >
          <router-link
            to="/map"
            class="nav-item"
            exact-active-class="is-active"
            aria-label="Travel map — coming soon"
          >
            Travel <span class="nav-item__badge">Soon</span>
          </router-link>
          <router-link
            to="/bank"
            class="nav-item"
            exact-active-class="is-active"
            aria-label="Bank — coming soon"
          >
            Bank <span class="nav-item__badge">Soon</span>
          </router-link>
          <button class="nav-item" type="button" disabled>
            Profile <span class="nav-item__badge">Soon</span>
          </button>
        </nav>
      </div>
    </div>
  </QHeader>
</template>

<style lang="scss" scoped>
.topbar {
  --header-text: #eee9df;
  --header-muted: #aaa69d;
  --header-amber: #efb34f;
  --header-coral: #dc877a;
  --header-stroke: rgba(214, 204, 184, 0.12);
  padding: 14px 20px 0;
  color: var(--header-text);
  background: linear-gradient(180deg, rgba(7, 7, 6, 0.99), rgba(7, 7, 6, 0.92));
  backdrop-filter: blur(18px);
}

.topbar__frame {
  position: relative;
  max-width: 1460px;
  margin: 0 auto;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 0% 0%, rgba(239, 179, 79, 0.045), transparent 45%),
    linear-gradient(145deg, #191916, #121310 65%, #0d0e0d);
  border: 1px solid var(--header-stroke);
  border-radius: 12px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 12px 28px -18px rgba(0, 0, 0, 0.9);
}

.topbar__frame::before {
  content: '';
  position: absolute;
  inset: 0 12px auto;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(239, 179, 79, 0.2),
    rgba(233, 222, 199, 0.1),
    transparent
  );
  pointer-events: none;
}

.topbar__inner {
  display: grid;
  grid-template-columns: minmax(238px, 0.85fr) minmax(0, 2.35fr);
  align-items: center;
  gap: 32px;
  padding: 16px 20px;
}

.brand {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  gap: 14px;
  min-width: 0;
  color: inherit;
  text-decoration: none;
  border-radius: 8px;
}

.brand__seal {
  display: grid;
  place-items: center;
  flex: 0 0 64px;
  width: 64px;
  height: 64px;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(239, 179, 79, 0.1), transparent 80%),
    linear-gradient(160deg, #212019, #131411);
  border: 1px solid rgba(239, 179, 79, 0.24);
  border-radius: 10px;
  box-shadow:
    inset 0 1px 0 rgba(255, 226, 177, 0.07),
    0 2px 6px rgba(0, 0, 0, 0.18);
  transition:
    border-color var(--t-fast),
    background var(--t-fast);
}

.brand__mark {
  display: block;
  object-fit: contain;
}

.brand:hover .brand__seal {
  border-color: rgba(239, 179, 79, 0.5);
}

.brand__text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.brand__name {
  color: var(--header-amber);
  font-family: 'Barlow Condensed', 'Arial Narrow', var(--sans);
  font-size: 29px;
  font-weight: 800;
  letter-spacing: 0.12em;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.6);
}

.brand__sub {
  color: var(--header-muted);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.18em;
  line-height: 1.2;
  text-transform: uppercase;
}

.topbar__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(0, 1.15fr) minmax(112px, 1fr);
  gap: 8px;
  margin: 0;
}

.stat {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 7px;
  min-width: 0;
  min-height: 64px;
  padding: 11px 14px 10px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent 46%),
    linear-gradient(135deg, #151613, #0c0d0c);
  border: 1px solid rgba(214, 204, 184, 0.13);
  border-radius: 10px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.055),
    inset 0 -1px 0 rgba(0, 0, 0, 0.36),
    inset 0 0 0 1px rgba(0, 0, 0, 0.18),
    0 5px 12px -9px rgba(0, 0, 0, 0.85);
}

.stat::before {
  position: absolute;
  top: 0;
  right: 16px;
  left: 16px;
  z-index: 0;
  height: 1px;
  content: '';
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.11), transparent);
}

.stat::after {
  position: absolute;
  right: 14px;
  bottom: 8px;
  left: 14px;
  z-index: 0;
  height: 18px;
  content: '';
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.18), transparent 72%);
  pointer-events: none;
}

.stat > * {
  position: relative;
  z-index: 1;
}

.stat dd {
  margin: 0;
}

.stat__label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--header-muted);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  line-height: 1;
  text-transform: uppercase;
}

.stat__label::after {
  flex: 1 1 auto;
  height: 1px;
  min-width: 8px;
  content: '';
  background: linear-gradient(90deg, rgba(214, 204, 184, 0.14), transparent);
}

.stat__value {
  overflow: hidden;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat__value--gold {
  color: var(--header-amber);
}
.stat__value--wine {
  color: var(--header-coral);
}
.stat__value--location {
  font-size: 17px;
}
.stat__of {
  color: var(--header-muted);
  font-size: 13px;
  font-weight: 400;
}

.topbar__nav-wrap {
  background: rgba(4, 4, 3, 0.38);
  border-top: 1px solid var(--header-stroke);
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.12);
}

.topbar__nav {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  padding: 6px;
}

.nav-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  min-width: 0;
  padding: 8px 12px;
  color: var(--header-muted);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  transition:
    color var(--t-fast),
    background var(--t-fast),
    border-color var(--t-fast);
}

.nav-item:not(:disabled):hover {
  color: var(--header-text);
  background: rgba(231, 219, 194, 0.045);
  border-color: var(--header-stroke);
}

.nav-item.is-active,
.nav-item.is-active:hover {
  color: var(--header-amber);
  background: linear-gradient(180deg, #272116, #17140f);
  border-color: rgba(239, 179, 79, 0.2);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.045),
    0 2px 3px rgba(0, 0, 0, 0.16);
}

.nav-item.is-active::after {
  content: '';
  position: absolute;
  inset: auto 12px -1px;
  height: 3px;
  background: linear-gradient(180deg, #f1c773, #c58b32);
  border-radius: 2px 2px 0 0;
  box-shadow: 0 -2px 10px rgba(239, 179, 79, 0.08);
}

.nav-item:not(:disabled):active {
  background: #15130f;
}
.nav-item:disabled {
  cursor: not-allowed;
  color: #908c83;
}

.nav-item__badge {
  padding: 3px 6px;
  color: var(--header-muted);
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  background: rgba(5, 10, 15, 0.2);
  border: 1px solid var(--header-stroke);
  border-radius: 12px;
}

.brand:focus-visible,
.nav-item:focus-visible {
  outline: 2px solid var(--header-amber);
  outline-offset: -2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 1180px) {
  .topbar__inner {
    grid-template-columns: minmax(220px, 0.75fr) minmax(0, 2.35fr);
    gap: 20px;
    padding-inline: 16px;
  }
  .stat {
    padding-inline: 11px;
  }
  .brand {
    gap: 12px;
  }
  .brand__name {
    font-size: 27px;
  }
}

@media (max-width: 1000px) {
  .topbar__inner {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
  }
  .topbar__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(0, 1.15fr) minmax(112px, 1fr);
  }
}

@media (max-width: 600px) {
  .topbar {
    padding: 8px 10px 0;
  }
  .topbar__frame {
    border-radius: 10px;
  }
  .topbar__inner {
    gap: 12px;
    padding: 12px;
  }
  .brand__seal {
    flex-basis: 48px;
    width: 48px;
    height: 48px;
    border-radius: 8px;
  }
  .brand__mark {
    width: 42px;
    height: 42px;
  }
  .brand__name {
    font-size: 25px;
  }
  .brand__sub {
    font-size: 9px;
  }
  .topbar__stats {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 8px;
  }
  .stat {
    grid-column: span 2;
    gap: 6px;
    min-height: 54px;
    padding: 9px 10px;
    border-radius: 6px;
  }
  .stat__label {
    font-size: 9px;
  }
  .stat__value {
    font-size: clamp(15px, 4.5vw, 18px);
  }
  .stat__of {
    font-size: 11px;
  }
  .stat--location,
  .stat--heat {
    grid-column: span 3;
  }
  .stat__value--location {
    font-size: 16px;
  }
  .topbar__nav {
    gap: 4px;
    padding: 4px;
  }
  .nav-item {
    flex-direction: column;
    gap: 5px;
    min-height: 48px;
    padding: 6px 3px;
    font-size: 12px;
  }
  .nav-item__badge {
    padding: 2px 5px;
    font-size: 9px;
  }
  .nav-item.is-active::after {
    right: 8px;
    left: 8px;
    height: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand__seal,
  .nav-item {
    transition: none;
  }
}
</style>
