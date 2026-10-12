import type { City, CityId } from 'types';

export const CITIES: City[] = [
  {
    id: 'bronx',
    name: 'The Bronx',
    x: 620,
    y: 80,
    links: ['harlem', 'queens'],
    demand: { weed: 1.35, coke: 0.72, speed: 1.15 },
  },

  {
    id: 'harlem',
    name: 'Harlem',
    x: 600,
    y: 160,
    links: ['bronx', 'manhattan'],
    demand: { weed: 0.78, hash: 1.25, ludes: 0.85 },
  },

  {
    id: 'manhattan',
    name: 'Manhattan',
    x: 580,
    y: 260,
    links: ['harlem', 'jersey', 'queens', 'brooklyn'],
    demand: { coke: 1.4, acid: 1.2, weed: 1.1 },
  },

  {
    id: 'queens',
    name: 'Queens',
    x: 760,
    y: 220,
    links: ['bronx', 'manhattan', 'longisland', 'brooklyn'],
    demand: { shrooms: 0.75, opium: 1.25 },
  },

  {
    id: 'longisland',
    name: 'Long Island',
    x: 880,
    y: 320,
    links: ['queens'],
    demand: { coke: 1.3, ludes: 1.2, acid: 0.8 },
  },

  {
    id: 'brooklyn',
    name: 'Brooklyn',
    x: 640,
    y: 380,
    links: ['manhattan', 'queens', 'coney', 'staten'],
    demand: { speed: 0.8, hash: 1.15, shrooms: 1.1 },
  },

  {
    id: 'coney',
    name: 'Coney Island',
    x: 620,
    y: 500,
    links: ['brooklyn'],
    demand: { ludes: 0.7, opium: 1.35 },
  },

  {
    id: 'staten',
    name: 'Staten Island',
    x: 420,
    y: 460,
    links: ['brooklyn', 'jersey'],
    demand: { weed: 1.25, shrooms: 0.8 },
  },

  {
    id: 'jersey',
    name: 'Jersey Docks',
    x: 380,
    y: 280,
    links: ['manhattan', 'staten'],
    demand: { coke: 0.68, opium: 0.75, speed: 1.3 },
  },
];

export const CITY_BY_ID = new Map<CityId, City>(CITIES.map((c) => [c.id, c]));

export function getCity(id: CityId): City {
  const city = CITY_BY_ID.get(id);
  if (!city) throw new Error(`Unknown city: ${id}`);
  return city;
}
