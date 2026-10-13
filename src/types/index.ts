// -----------------------------------------------------------------------------
// Domain type definitions.
//
// Literal unions for IDs (rather than plain `string`) so that every
// Record<DrugId, ...> / Record<CityId, ...> is exhaustively checked at
// compile time. Missing a drug in the data file becomes a red error
// instead of a silent undefined.
// -----------------------------------------------------------------------------

export type DrugId =
  'weed' | 'hash' | 'speed' | 'shrooms' | 'acid' | 'oxy' | 'opium' | 'coke' | 'heroin' | 'fentanyl';

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
  base: number; // neutral-market reference price, $/gram
  vol: number; // 0..1 — price volatility spread
  swatch: string; // dim identifier colour
  description: string; // one-line player-facing blurb, shown in tooltip
}

export interface City {
  id: CityId;
  name: string;
  x: number;
  y: number;
  links: CityId[];
  demand: Partial<Record<DrugId, number>>;
}

export interface Car {
  id: CarId;
  name: string;
  capacity: number;
  range: number;
  speed: number;
  price: number;
}

// -----------------------------------------------------------------------------

export type LogKind = 'info' | 'good' | 'bad';

export interface LogEntry {
  day: number;
  kind: LogKind;
  text: string;
}

// -----------------------------------------------------------------------------
// Market
// -----------------------------------------------------------------------------

export type PriceTrend = 'up' | 'down' | 'flat';

export type SupplyState = Partial<Record<CityId, Partial<Record<DrugId, number>>>>;

export interface MarketPrices {
  cityId: CityId;
  epoch: number;
  prices: Record<DrugId, number>;
  trends: Record<DrugId, PriceTrend>;
}

// -----------------------------------------------------------------------------
// Game state
// -----------------------------------------------------------------------------

export type GamePhase = 'survival' | 'building' | 'kingpin' | 'endgame';

export interface UnlockedFeatures {
  bank: boolean;
  profile: boolean;
}

export interface PlayerHealth {
  current: number;
  max: number;
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

  phase: GamePhase;
  unlockedFeatures: UnlockedFeatures;
  health: PlayerHealth;

  supply: SupplyState;
  market: MarketPrices | null;
}

export type TradeResult = { ok: true } | { ok: false; reason: string };
