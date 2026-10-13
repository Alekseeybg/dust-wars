<script setup lang="ts">
import { Notify } from 'quasar'
import { useGameStore } from 'stores/game'
import Panel from './Panel.vue'

const game = useGameStore()

function addMoney() {
  game.debugAddMoney(2000)
  Notify.create({
    type: 'positive',
    message: '+$2,000',
    timeout: 1000,
  })
}

function reset() {
  const confirmed = window.confirm(
    'Reset the game? This wipes the save and starts a new run.',
  )
  if (!confirmed) return
  game.reset()
  Notify.create({
    type: 'warning',
    message: 'Game reset.',
    timeout: 1400,
  })
}
</script>

<template>
  <Panel title="Debug">
    <div class="debug">
      <button class="btn btn--block btn--lg" type="button" @click="addMoney">
        <span>+$2,000</span>
        <span class="btn__value mono">$</span>
      </button>
      <button class="btn btn--block btn--lg btn--danger" type="button" @click="reset">
        <span>Reset Game</span>
        <span class="btn__value mono">↻</span>
      </button>
    </div>
  </Panel>
</template>

<style lang="scss" scoped>
.debug {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
