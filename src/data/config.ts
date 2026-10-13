import type { CityId } from 'types';

/**
 * All game balance constants in one place. When tuning, edit here —
 * nothing else in the codebase should hard-code these values.
 */
export const CONFIG = {
  START_CASH: 3000,
  START_DEBT: 15000,
  MAX_DAYS: 90,

  START_CITY: 'brooklyn' as CityId,
  START_CAPACITY: 100,
  START_HEALTH_MAX: 50,

  HEAT_MAX: 10,

  /**
   * Days between market price refreshes. Prices are identical for every
   * day within an epoch (days 1-3 = epoch 0, days 4-6 = epoch 1, ...).
   * This gives the player a rhythm: arrive, read the market, act before
   * the window closes.
   */
  PRICE_CYCLE_DAYS: 3,

  /**
   * Supply-driven economy. Each (city, drug) has a supply level around
   * 1.0. Buying decreases it (price rises); selling increases it (price
   * falls). Supply is clamped to [SUPPLY_MIN, SUPPLY_MAX]. Every
   * SUPPLY_RESET_EPOCHS epochs, all supply resets to 1.0 — a "market
   * reset" that the player learns to time their trades around.
   */
  SUPPLY_MIN: 0.5,
  SUPPLY_MAX: 2.0,
  /** Per-gram supply shift; 200g traded ≈ 10% price impact. */
  SUPPLY_IMPACT_PER_GRAM: 0.0005,
  /** Every N epochs (N × 3 days), supply resets to neutral. */
  SUPPLY_RESET_EPOCHS: 3,
} as const;
