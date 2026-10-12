<script setup lang="ts">
import TopBar from 'components/TopBar.vue';
import CargoHold from 'components/CargoHold.vue';
import StreetLog from 'components/StreetLog.vue';
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

.shell__main {
  min-width: 0;
}

.shell__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  position: sticky;
  top: 84px;
}

@media (max-width: 1040px) {
  .shell {
    grid-template-columns: minmax(0, 1fr);
  }
  .shell__sidebar {
    position: static;
  }
}
</style>
