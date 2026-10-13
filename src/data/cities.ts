import type { City, CityId } from 'types';

/**
 * Cities and their demand modifiers.
 *
 * x / y — map coordinates in a 1000×620 viewBox
 * links — directly reachable cities (undirected)
 * demand — per-drug price multiplier for this city.
 *   < 1 means the drug is cheap here (good buy),
 *   > 1 means it sells high here (good sell).
 *   Missing entries default to 1 (neutral).
 *
 * Distribution is thematic, not arbitrary:
 *   - Import points (Jersey Docks) are cheap for smuggled goods.
 *   - Consumer markets (Harlem, Bronx, Brooklyn) are expensive for
 *     drugs where local demand is high.
 *   - Wealthy areas (Manhattan, Long Island) command a premium.
 *   - Every drug has at least one clear cheap city and one clear
 *     expensive city, so a trading route exists for it.
 */
export const CITIES: readonly City[] = [
  {
    id: 'bronx',
    name: 'The Bronx',
    x: 620,
    y: 80,
    links: ['harlem', 'queens'],
    demand: { weed: 1.35, coke: 0.72, speed: 1.15, heroin: 1.1 },
  },
  {
    id: 'harlem',
    name: 'Harlem',
    x: 600,
    y: 160,
    links: ['bronx', 'manhattan'],
    demand: { weed: 0.78, hash: 1.25, heroin: 0.85, coke: 1.15 },
  },
  {
    id: 'manhattan',
    name: 'Manhattan',
    x: 580,
    y: 260,
    links: ['harlem', 'jersey', 'queens', 'brooklyn'],
    demand: { coke: 1.4, acid: 1.2, weed: 1.1, oxy: 1.3, heroin: 1.25 },
  },
  {
    id: 'queens',
    name: 'Queens',
    x: 760,
    y: 220,
    links: ['bronx', 'manhattan', 'longisland', 'brooklyn'],
    demand: { shrooms: 0.75, opium: 1.25, oxy: 1.15 },
  },
  {
    id: 'longisland',
    name: 'Long Island',
    x: 880,
    y: 320,
    links: ['queens'],
    demand: { coke: 1.3, oxy: 1.35, acid: 0.8 },
  },
  {
    id: 'brooklyn',
    name: 'Brooklyn',
    x: 640,
    y: 380,
    links: ['manhattan', 'queens', 'coney', 'staten'],
    demand: {
      speed: 0.8,
      hash: 1.15,
      shrooms: 1.1,
      weed: 0.95,
      fentanyl: 1.3,
    },
  },
  {
    id: 'coney',
    name: 'Coney Island',
    x: 620,
    y: 500,
    links: ['brooklyn'],
    demand: { heroin: 0.7, opium: 1.35, weed: 1.05 },
  },
  {
    id: 'staten',
    name: 'Staten Island',
    x: 420,
    y: 460,
    links: ['brooklyn', 'jersey'],
    demand: { weed: 1.25, shrooms: 0.8, oxy: 1.3 },
  },
  {
    id: 'jersey',
    name: 'Jersey Docks',
    x: 380,
    y: 280,
    links: ['manhattan', 'staten'],
    demand: {
      coke: 0.68,
      opium: 0.75,
      speed: 1.3,
      heroin: 0.7,
      fentanyl: 0.65,
      oxy: 0.85,
      hash: 0.85,
    },
  },
];

export const CITY_BY_ID = new Map<CityId, City>(CITIES.map((c) => [c.id, c]));

export function getCity(id: CityId): City {
  const city = CITY_BY_ID.get(id);
  if (!city) throw new Error(`Unknown city: ${id}`);
  return city;
}
