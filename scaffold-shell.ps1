# scaffold-shell.ps1 — Dope Wars shell scaffolding.
# Creates all SCSS, layout, component, store, router, and page-stub files.

$ErrorActionPreference = 'Stop'

function Write-File {
  param([string]$Path, [string]$Content)
  $dir = Split-Path $Path -Parent
  if ($dir -and -not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
  $full = Join-Path (Get-Location) $Path
  [System.IO.File]::WriteAllText($full, $Content)
  Write-Host "  wrote $Path"
}

Write-Host ""
Write-Host "Scaffolding Dope Wars shell..." -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------------- SCSS -----

Write-File 'src/css/quasar.variables.scss' @'
// Quasar's semantic color map — mapped to the "Dim Gold" palette.
$primary   : #b8893f;
$secondary : #5c7a3f;
$accent    : #d4a860;

$dark      : #0c0a09;
$dark-page : #050505;

$positive  : #82a35d;
$negative  : #8a2a2a;
$info      : #8b6fe0;
$warning   : #d4a860;
'@

Write-File 'src/css/tokens.scss' @'
// CSS custom properties — single source of truth for the Dim Gold palette.
// Components reference these (--gold, --wine, etc.) rather than literals.
:root {
  // surfaces
  --bg-0: #050505;
  --bg-1: #0c0a09;
  --bg-panel: #0a0908;
  --bg-panel-2: #100e0c;
  --bg-inset: #060505;

  // strokes
  --stroke:   rgba(255, 255, 255, .055);
  --stroke-2: rgba(255, 255, 255, .10);

  // accents
  --gold:      #b8893f;
  --gold-soft: #d4a860;
  --gold-dim:  #6b4d20;

  --forest:      #5c7a3f;
  --forest-soft: #82a35d;

  --wine:      #8a2a2a;
  --wine-soft: #b84a4a;

  --violet: #8b6fe0;

  // type
  --text:    #d4c9b8;
  --muted:   #7a7068;
  --muted-2: #4a443d;

  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --sans: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;

  // type scale — do not shrink these
  --fs-label: 11px;
  --fs-xs:    13.5px;
  --fs-sm:    15px;
  --fs-base:  16px;
  --fs-md:    18px;
  --fs-lg:    20px;
  --fs-xl:    24px;

  // spacing
  --sp-1:  4px;
  --sp-2:  8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 20px;
  --sp-6: 24px;
  --sp-7: 32px;
  --sp-8: 48px;

  // radius
  --r-sm: 3px;
  --r-md: 5px;
  --r-lg: 8px;

  // motion
  --t-fast: 120ms ease;
  --t-med:  220ms ease;
}
'@

Write-File 'src/css/base.scss' @'
html {
  font-size: var(--fs-base);
}

body {
  font-family: var(--sans);
  font-size: var(--fs-base);
  line-height: 1.5;
  color: var(--text);

  background-color: var(--bg-0);
  background-image:
    radial-gradient(1300px 800px at 12% -10%, #1a1208 0%, transparent 60%),
    radial-gradient(1000px 700px at 100% 110%, #140804 0%, transparent 55%),
    linear-gradient(180deg, #050505, #0c0a09);
  background-attachment: fixed;
}

// Film grain overlay — fixed, non-interactive.
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: .055;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E");
}

.mono {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;
}

.muted { color: var(--muted); }
'@

Write-File 'src/css/quasar-overrides.scss' @'
// Strip Quasar's Material Design personality — we want the shell to feel
// like a bespoke, dim interface, not a web-app kit.
.q-header {
  box-shadow: none !important;
  background: transparent !important;
}

.q-page-container {
  background: transparent !important;
}

.q-layout {
  background: transparent !important;
}
'@

Write-File 'src/css/app.scss' @'
// Global stylesheet entry — Quasar's config loads this file; it pulls the
// others in via @use (which also emits their CSS output).
@use './tokens';
@use './base';
@use './quasar-overrides';
'@

# ---------------------------------------------------------------- types ----

Write-File 'src/types/index.ts' @'
// -----------------------------------------------------------------------------
// Domain type definitions.
//
// Literal unions for IDs (rather than plain `string`) so that every
// Record<DrugId, ...> / Record<CityId, ...> is exhaustively checked at
// compile time. Missing a drug in the data file becomes a red error
// instead of a silent undefined.
// -----------------------------------------------------------------------------

export type DrugId =
  | 'weed' | 'hash' | 'ludes' | 'speed'
  | 'shrooms' | 'acid' | 'opium' | 'coke'
  | 'fentanyl'

export type CityId =
  | 'bronx' | 'harlem' | 'manhattan' | 'queens' | 'longisland'
  | 'brooklyn' | 'coney' | 'staten' | 'jersey'

export type CarId = 'walking' | 'beater' | 'sedan' | 'van'

// -----------------------------------------------------------------------------

export type DrugTier = 'common' | 'uncommon' | 'rare'

export interface Drug {
  id: DrugId
  name: string
  tier: DrugTier
  base: number      // neutral-market reference price
  vol: number       // 0..1 — price volatility spread
  swatch: string    // dim identifier colour
}

export interface City {
  id: CityId
  name: string
  x: number         // map coordinates in a 1000x620 viewBox
  y: number
  links: CityId[]   // directly reachable cities (undirected)
  /**
   * Per-drug price multiplier. < 1 means the drug is cheap here (buy),
   * > 1 means expensive here (sell). Missing entries default to 1.
   */
  demand: Partial<Record<DrugId, number>>
}

export interface Car {
  id: CarId
  name: string
  capacity: number  // max units of cargo
  range: number     // miles on a full tank; 0 = no fuel system (on foot)
  speed: number     // miles per day on the road
  price: number
}

// -----------------------------------------------------------------------------

export type LogKind = 'info' | 'good' | 'bad'

export interface LogEntry {
  day: number
  kind: LogKind
  text: string
}

export interface GameState {
  seed: number
  day: number
  cash: number
  debt: number
  cityId: CityId
  carId: CarId
  heat: number
  cargo: Partial<Record<DrugId, number>>
  capacity: number
  log: LogEntry[]
}
'@

# ---------------------------------------------------------------- data -----

Write-File 'src/data/drugs.ts' @'
import type { Drug, DrugId } from 'types'

export const DRUGS: Drug[] = [
  { id: 'weed',     name: 'Weed',     tier: 'common',   base:   45, vol: .18, swatch: '#4a5f36' },
  { id: 'hash',     name: 'Hash',     tier: 'common',   base:   90, vol: .18, swatch: '#5a4128' },
  { id: 'ludes',    name: 'Ludes',    tier: 'common',   base:   70, vol: .20, swatch: '#544a3c' },
  { id: 'speed',    name: 'Speed',    tier: 'common',   base:  120, vol: .22, swatch: '#635c46' },
  { id: 'shrooms',  name: 'Shrooms',  tier: 'uncommon', base:  180, vol: .28, swatch: '#5f5a40' },
  { id: 'acid',     name: 'Acid',     tier: 'uncommon', base:  320, vol: .30, swatch: '#5b4d82' },
  { id: 'opium',    name: 'Opium',    tier: 'rare',     base:  620, vol: .35, swatch: '#6a4258' },
  { id: 'coke',     name: 'Coke',     tier: 'rare',     base:  850, vol: .38, swatch: '#7d3a3a' },
  { id: 'fentanyl', name: 'Fentanyl', tier: 'rare',     base: 1400, vol: .48, swatch: '#733e63' },
]

export const DRUG_BY_ID = new Map<DrugId, Drug>(DRUGS.map((d) => [d.id, d]))

export function getDrug(id: DrugId): Drug {
  const drug = DRUG_BY_ID.get(id)
  if (!drug) throw new Error(`Unknown drug: ${id}`)
  return drug
}
'@

# ---------------------------------------------------------------- store ----

Write-File 'src/stores/game.ts' @'
import { defineStore } from 'pinia'
import type { GameState, CityId } from 'types'
import { getCity } from 'data/cities'

const START_CASH = 2000
const START_DEBT = 30000
const MAX_DAYS = 60
const START_CITY: CityId = 'brooklyn'
const START_CAPACITY = 100
const HEAT_MAX = 10

export const LIMITS = {
  MAX_DAYS,
  HEAT_MAX,
} as const

function freshGame(seed: number): GameState {
  const city = getCity(START_CITY)
  return {
    seed,
    day: 1,
    cash: START_CASH,
    debt: START_DEBT,
    cityId: START_CITY,
    carId: 'walking',
    heat: 0,
    cargo: {},
    capacity: START_CAPACITY,
    log: [
      {
        day: 1,
        kind: 'info',
        text: `You step off the bus in ${city.name} with $${START_CASH}.`,
      },
      {
        day: 1,
        kind: 'bad',
        text: `The loan shark wants $${START_DEBT} back in ${MAX_DAYS} days.`,
      },
    ],
  }
}

export const useGameStore = defineStore('game', {
  state: (): GameState => freshGame(Date.now() >>> 0),

  getters: {
    city: (s) => getCity(s.cityId),
    cargoUsed: (s) =>
      Object.values(s.cargo).reduce<number>((sum, qty) => sum + (qty ?? 0), 0),
  },

  actions: {
    reset() {
      Object.assign(this, freshGame(Date.now() >>> 0))
    },
  },
})
'@

# ---------------------------------------------------------------- router ---

Write-File 'src/router/routes.ts' @'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/market' },
      { path: 'market', name: 'market', component: () => import('pages/market/index.vue') },
      { path: 'map',    name: 'map',    component: () => import('pages/map/index.vue') },
      { path: 'bank',   name: 'bank',   component: () => import('pages/bank/index.vue') },
      { path: 'log',    name: 'log',    component: () => import('pages/log/index.vue') },
    ],
  },
  { path: '/:catchAll(.*)*', redirect: '/market' },
]

export default routes
'@

Write-File 'src/router/index.ts' @'
import { route } from 'quasar/wrappers'
import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './routes'

export default route(function (/* { store, ssrContext } */) {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHashHistory(),
  })

  return Router
})
'@

# ---------------------------------------------------------------- app -----

Write-File 'src/App.vue' @'
<template>
  <router-view />
</template>
'@

# ---------------------------------------------------------------- layout --

Write-File 'src/layouts/MainLayout.vue' @'
<script setup lang="ts">
import TopBar from 'components/TopBar.vue'
import CargoHold from 'components/CargoHold.vue'
import StreetLog from 'components/StreetLog.vue'
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <TopBar />

    <q-page-container>
      <div class="shell">
        <main class="shell__main">
          <router-view />
        </main>
        <aside class="shell__sidebar">
          <CargoHold />
          <StreetLog />
        </aside>
      </div>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: var(--sp-4);
  align-items: start;
  max-width: 1500px;
  margin: 0 auto;
  padding: var(--sp-5);
}

.shell__main { min-width: 0; }

.shell__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  position: sticky;
  top: 84px;
}

@media (max-width: 1040px) {
  .shell { grid-template-columns: minmax(0, 1fr); }
  .shell__sidebar { position: static; }
}
</style>
'@

# ---------------------------------------------------------------- components

Write-File 'src/components/Panel.vue' @'
<script setup lang="ts">
defineProps<{ title: string; meta?: string }>()
</script>

<template>
  <section class="panel">
    <header class="panel__head">
      <h2 class="panel__title">{{ title }}</h2>
      <span v-if="meta" class="panel__meta mono">{{ meta }}</span>
    </header>
    <div class="panel__body">
      <slot />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.panel {
  background:
    linear-gradient(180deg, rgba(255,255,255,.018), rgba(255,255,255,0) 40%),
    var(--bg-panel);
  border: 1px solid var(--stroke);
  border-radius: var(--r-md);
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.02),
    0 8px 24px -18px #000;
}
.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
  padding: 14px var(--sp-5);
  border-bottom: 1px solid var(--stroke);
  background: rgba(255,255,255,.012);
}
.panel__title {
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--gold);
}
.panel__meta {
  font-size: var(--fs-sm);
  color: var(--muted);
}
.panel__body {
  padding: var(--sp-5);
}
</style>
'@

Write-File 'src/components/HeatMeter.vue' @'
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ level: number; max: number }>()

const hot = computed(() => props.level >= 6)
const pips = computed(() =>
  Array.from({ length: props.max }, (_, i) => i < props.level)
)
</script>

<template>
  <div class="stat">
    <span class="stat__label">Heat</span>
    <span
      class="meter"
      :class="{ 'meter--hot': hot }"
      role="meter"
      :aria-valuenow="level"
      aria-valuemin="0"
      :aria-valuemax="max"
    >
      <span
        v-for="(on, i) in pips"
        :key="i"
        class="meter__pip"
        :class="{ 'is-on': on }"
      />
    </span>
  </div>
</template>

<style lang="scss" scoped>
.stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stat__label {
  font-size: var(--fs-label);
  font-weight: 500;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--muted);
}
.meter {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 16px;
}
.meter__pip {
  width: 4px;
  height: 10px;
  border-radius: 1px;
  background: var(--muted-2);
  opacity: .28;
  transition: background var(--t-med), opacity var(--t-med), height var(--t-med);
}
.meter__pip.is-on {
  opacity: 1;
  height: 16px;
  background: var(--gold);
}
.meter--hot .meter__pip.is-on {
  background: var(--wine-soft);
}
</style>
'@

Write-File 'src/components/TopBar.vue' @'
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
      <div class="brand">
        <span class="brand__name">Dope Wars</span>
        <span class="brand__sub">Street Edition</span>
      </div>

      <div class="topbar__stats">
        <div class="stat">
          <span class="stat__label">Cash</span>
          <span class="stat__value stat__value--gold mono">{{ cashStr }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">Debt</span>
          <span class="stat__value stat__value--wine mono">{{ debtStr }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">Day</span>
          <span class="stat__value mono">
            {{ day }}<span class="stat__of">/{{ LIMITS.MAX_DAYS }}</span>
          </span>
        </div>
        <div class="stat">
          <span class="stat__label">Location</span>
          <span class="stat__value">{{ city.name }}</span>
        </div>
        <HeatMeter :level="heat" :max="LIMITS.HEAT_MAX" />
      </div>
    </div>
  </q-header>
</template>

<style lang="scss" scoped>
.topbar {
  border-bottom: 1px solid var(--stroke);
  background: rgba(5, 5, 5, .82) !important;
  backdrop-filter: blur(10px);
}
.topbar__inner {
  display: flex;
  align-items: center;
  gap: var(--sp-6);
  max-width: 1500px;
  margin: 0 auto;
  padding: var(--sp-3) var(--sp-5);
}
.brand { display: flex; flex-direction: column; gap: 1px; }
.brand__name {
  font-size: var(--fs-md);
  font-weight: 600;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--gold-soft);
}
.brand__sub {
  font-size: var(--fs-label);
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--muted-2);
}
.topbar__stats {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--sp-7);
}
.stat { display: flex; flex-direction: column; gap: 3px; }
.stat__label {
  font-size: var(--fs-label);
  font-weight: 500;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--muted);
}
.stat__value {
  font-size: var(--fs-lg);
  font-weight: 600;
  line-height: 1;
  color: var(--text);
}
.stat__value--gold { color: var(--gold-soft); }
.stat__value--wine { color: var(--wine-soft); }
.stat__of { font-size: var(--fs-sm); font-weight: 500; color: var(--muted-2); }

@media (max-width: 900px) {
  .topbar__inner { flex-wrap: wrap; gap: var(--sp-5); }
  .topbar__stats { margin-left: 0; gap: var(--sp-5); }
}
</style>
'@

Write-File 'src/components/CargoHold.vue' @'
<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from 'stores/game'
import { getDrug } from 'data/drugs'
import type { DrugId } from 'types'
import Panel from './Panel.vue'

const game = useGameStore()
const { cargo, capacity } = storeToRefs(game)

const used = computed(() => game.cargoUsed)
const pct = computed(() => Math.min(100, (used.value / capacity.value) * 100))
const warn = computed(() => pct.value >= 90)

const items = computed(() =>
  Object.entries(cargo.value)
    .filter((entry): entry is [string, number] => (entry[1] ?? 0) > 0)
    .map(([id, qty]) => ({
      id: id as DrugId,
      name: getDrug(id as DrugId).name,
      qty,
    }))
)
</script>

<template>
  <Panel title="Cargo Hold" :meta="`${used} / ${capacity}`">
    <div class="bar" :class="{ 'bar--warn': warn }">
      <div class="bar__fill" :style="{ width: pct + '%' }" />
    </div>

    <ul v-if="items.length" class="cargo">
      <li v-for="item in items" :key="item.id" class="cargo__row">
        <span class="cargo__name">{{ item.name }}</span>
        <span class="cargo__qty mono">{{ item.qty }}</span>
      </li>
    </ul>
    <p v-else class="empty">Hold is empty.</p>
  </Panel>
</template>

<style lang="scss" scoped>
.bar {
  height: 5px;
  border-radius: 3px;
  background: var(--bg-inset);
  border: 1px solid var(--stroke);
  overflow: hidden;
}
.bar__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold-dim), var(--gold));
  transition: width var(--t-med);
}
.bar--warn .bar__fill {
  background: linear-gradient(90deg, var(--wine), var(--wine-soft));
}
.cargo {
  margin-top: var(--sp-4);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.cargo__row {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-md);
}
.cargo__qty { color: var(--gold-soft); }
.empty {
  color: var(--muted-2);
  font-size: var(--fs-sm);
  margin-top: var(--sp-3);
}
</style>
'@

Write-File 'src/components/StreetLog.vue' @'
<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from 'stores/game'
import Panel from './Panel.vue'

const game = useGameStore()
const { log } = storeToRefs(game)

const recent = computed(() => [...log.value].slice(-5).reverse())
</script>

<template>
  <Panel title="Street Log">
    <ul class="log">
      <li
        v-for="(entry, i) in recent"
        :key="i"
        class="log__row"
        :class="`log__row--${entry.kind}`"
      >
        <span class="log__day mono">D{{ entry.day }}</span>
        <span class="log__text">{{ entry.text }}</span>
      </li>
    </ul>
    <router-link to="/log" class="log__more">View full log →</router-link>
  </Panel>
</template>

<style lang="scss" scoped>
.log {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.log__row {
  display: flex;
  gap: 10px;
  font-size: var(--fs-sm);
  line-height: 1.45;
}
.log__day {
  color: var(--muted-2);
  flex-shrink: 0;
}
.log__row--good .log__text { color: var(--forest-soft); }
.log__row--bad  .log__text { color: var(--wine-soft); }
.log__more {
  display: inline-block;
  margin-top: 14px;
  font-size: var(--fs-xs);
  letter-spacing: .08em;
  color: var(--muted);
  text-decoration: none;
  transition: color var(--t-fast);
}
.log__more:hover { color: var(--gold-soft); }
</style>
'@

# ---------------------------------------------------------------- pages ----

foreach ($name in @('market', 'map', 'bank', 'log')) {
  $title = (Get-Culture).TextInfo.ToTitleCase($name)
  Write-File "src/pages/$name/index.vue" @"
<script setup lang="ts">
import Panel from 'components/Panel.vue'
</script>

<template>
  <Panel title="$title">
    <div class="stub">
      <p class="stub__title">$title screen</p>
      <p class="stub__sub">Not yet built.</p>
    </div>
  </Panel>
</template>

<style lang="scss" scoped>
.stub {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-8) var(--sp-5);
  text-align: center;
}
.stub__title { font-size: var(--fs-md); font-weight: 600; color: var(--muted); }
.stub__sub { font-size: var(--fs-sm); color: var(--muted-2); max-width: 42ch; }
</style>
"@
}

Write-Host ""
Write-Host "Done. Now:" -ForegroundColor Green
Write-Host "  1. Confirm quasar.config.ts has 'dark: true' and plugins: ['Notify']."
Write-Host "  2. Delete src/pages/index/ (the old palette-test page) — no longer routed."
Write-Host "  3. Run: quasar dev"