// -----------------------------------------------------------------------------
// Domain type definitions.
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
  basePrice: number;
  volatility: number;
  swatch: string;
  description: string;
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
// Cargo
// -----------------------------------------------------------------------------

/**
 * A single purchase batch. Sold under FIFO — the oldest lot is consumed
 * first. `price` is per gram.
 */
export interface CargoLot {
  qty: number;
  price: number;
  day: number;
}

export type CargoLots = Partial<Record<DrugId, CargoLot[]>>;

export interface CargoGroup {
  id: DrugId;
  name: string;
  swatch: string;
  total: number;
  lots: CargoLot[];
}

// -----------------------------------------------------------------------------
// Log
// -----------------------------------------------------------------------------

export type LogKind = 'info' | 'good' | 'bad';

export type LogColor =
  | 'gold'
  | 'gold-soft'
  | 'forest'
  | 'forest-soft'
  | 'wine'
  | 'wine-soft'
  | 'violet'
  | 'text'
  | 'muted'
  | 'muted-2';

export interface LogSegment {
  text: string;
  bold?: boolean;
  color?: LogColor;
}

export interface LogEntry {
  day: number;
  kind: LogKind;
  segments: LogSegment[];
}

// -----------------------------------------------------------------------------
// Market
// -----------------------------------------------------------------------------

export type PriceTrend = 'up' | 'down' | 'flat';

export type TradeDirection = 'buy' | 'sell';

export interface SupplyPressure {
  amount: number;
  kind: 'neutral' | 'scarce' | 'glutted';
}

export type SupplyState = Partial<Record<CityId, Partial<Record<DrugId, number>>>>;

export interface MarketPrices {
  cityId: CityId;
  epoch: number;
  prices: Record<DrugId, number>;
  trends: Record<DrugId, PriceTrend>;
}

export interface PricePoint {
  day: number;
  epoch: number;
  price: number;
}

export type MarketHistory = Partial<Record<CityId, Partial<Record<DrugId, PricePoint[]>>>>;

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

  /**
   * Purchase lots per drug, oldest first. Quantity held and cost basis
   * are both derived from this — there is no separate cargo/cargoCost
   * map, by design.
   */
  cargoLots: CargoLots;

  capacity: number;
  log: LogEntry[];

  phase: GamePhase;
  unlockedFeatures: UnlockedFeatures;
  health: PlayerHealth;

  supply: SupplyState;
  market: MarketPrices | null;
  marketHistory: MarketHistory;
}

export type TradeResult = { ok: true } | { ok: false; reason: string };
