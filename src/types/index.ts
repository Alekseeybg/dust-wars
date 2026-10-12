// -----------------------------------------------------------------------------
// Domain type definitions.
//
// Literal unions for IDs (rather than plain `string`) so that every
// Record<DrugId, ...> / Record<CityId, ...> is exhaustively checked at
// compile time. Missing a drug in the data file becomes a red error
// instead of a silent undefined.
// -----------------------------------------------------------------------------

export type DrugId =
  'weed' | 'hash' | 'ludes' | 'speed' | 'shrooms' | 'acid' | 'opium' | 'coke' | 'fentanyl';

export type CityId =
  | 'bronx'
  | 'harlem'
  | 'manhattan'
  | 'queens'
  | 'longisland'
  | 'brooklyn'
  | 'coney'
  | 'staten'
  | 'jersey';

export type CarId = 'walking' | 'beater' | 'sedan' | 'van';

// -----------------------------------------------------------------------------

export type DrugTier = 'common' | 'uncommon' | 'rare';

export interface Drug {
  id: DrugId;
  name: string;
  tier: DrugTier;
  base: number; // neutral-market reference price
  vol: number; // 0..1 — price volatility spread
  swatch: string; // dim identifier colour
}

export interface City {
  id: CityId;
  name: string;
  x: number; // map coordinates in a 1000x620 viewBox
  y: number;
  links: CityId[]; // directly reachable cities (undirected)
  /**
   * Per-drug price multiplier. < 1 means the drug is cheap here (buy),
   * > 1 means expensive here (sell). Missing entries default to 1.
   */
  demand: Partial<Record<DrugId, number>>;
}

export interface Car {
  id: CarId;
  name: string;
  capacity: number; // max units of cargo
  range: number; // miles on a full tank; 0 = no fuel system (on foot)
  speed: number; // miles per day on the road
  price: number;
}

// -----------------------------------------------------------------------------

export type LogKind = 'info' | 'good' | 'bad';

export interface LogEntry {
  day: number;
  kind: LogKind;
  text: string;
}

export interface GameState {
  seed: number;
  day: number;
  cash: number;
  debt: number;
  cityId: CityId;
  carId: CarId;
  heat: number;
  cargo: Partial<Record<DrugId, number>>;
  capacity: number;
  log: LogEntry[];
}
