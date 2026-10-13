import type { GameState } from 'types';
import { getCity } from 'data/cities';
import { CONFIG } from 'data/config';
import { calculateMarket, emptySupply } from './pricing';
import { recordPricePoints } from './history';
import { logSegment } from './log';
import { money } from 'utils/format';

export function createGame(seed: number): GameState {
  const city = getCity(CONFIG.START_CITY);

  const state: GameState = {
    seed,
    day: 1,
    cash: CONFIG.START_CASH,
    debt: CONFIG.START_DEBT,
    cityId: CONFIG.START_CITY,
    carId: 'walking',
    heat: 0,
    cargoLots: {},
    capacity: CONFIG.START_CAPACITY,
    log: [
      {
        day: 1,
        kind: 'info',
        segments: [
          logSegment('You step off the bus in '),
          logSegment(city.name, { bold: true }),
          logSegment(' with '),
          logSegment(money(CONFIG.START_CASH), { bold: true, color: 'gold-soft' }),
          logSegment('.'),
        ],
      },
      {
        day: 1,
        kind: 'bad',
        segments: [
          logSegment('The loan shark wants ', { color: 'wine-soft' }),
          logSegment(money(CONFIG.START_DEBT), { bold: true, color: 'wine-soft' }),
          logSegment(` back in ${CONFIG.MAX_DAYS} days.`, { color: 'wine-soft' }),
        ],
      },
    ],
    phase: 'survival',
    unlockedFeatures: { bank: false, profile: false },
    health: {
      current: CONFIG.START_HEALTH_MAX,
      max: CONFIG.START_HEALTH_MAX,
    },
    supply: emptySupply(),
    market: null,
    marketHistory: {},
  };

  state.market = calculateMarket(city, state.day, state.seed, state.supply);
  state.marketHistory = recordPricePoints({}, state.market, state.day);
  return state;
}
