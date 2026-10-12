import { defineStore } from 'pinia';
import type { GameState, CityId } from 'types';
import { getCity } from 'data/cities';

const START_CASH = 2000;
const START_DEBT = 30000;
const MAX_DAYS = 60;
const START_CITY: CityId = 'brooklyn';
const START_CAPACITY = 100;
const HEAT_MAX = 10;

export const LIMITS = {
  MAX_DAYS,
  HEAT_MAX,
} as const;

function freshGame(seed: number): GameState {
  const city = getCity(START_CITY);
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
  };
}

export const useGameStore = defineStore('game', {
  state: (): GameState => freshGame(Date.now() >>> 0),

  getters: {
    city: (s) => getCity(s.cityId),
    cargoUsed: (s) => Object.values(s.cargo).reduce<number>((sum, qty) => sum + (qty ?? 0), 0),
  },

  actions: {
    reset() {
      Object.assign(this, freshGame(Date.now() >>> 0));
    },
  },
});
