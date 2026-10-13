import type { Drug, PriceTrend, SupplyPressure } from 'types';

/** Display data for one market row; independent of the Vue component. */
export interface MarketRow {
  drug: Drug;
  price: number;
  trend: PriceTrend;
  held: number;
  pressure: SupplyPressure;
  /** Catalog position, retained as a stable tie-breaker when sorting. */
  defaultOrder: number;
}
