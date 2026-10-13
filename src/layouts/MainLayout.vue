<script setup lang="ts">
import TopBar from 'components/TopBar.vue';
import CargoHold from 'components/CargoHold.vue';
import ProfileBox from 'components/ProfileBox.vue';
import ActionsBox from 'components/ActionsBox.vue';
import DebugPanel from 'components/DebugPanel.vue';
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
          <ProfileBox />
          <ActionsBox />
          <DebugPanel />
        </aside>
      </div>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  align-items: start;
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px;
}

.shell__main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.shell__sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 96px;
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
