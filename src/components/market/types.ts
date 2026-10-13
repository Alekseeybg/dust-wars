import type { Drug, PriceTrend, SupplyPressure } from 'types';

/** Display data for one market row; independent of the Vue component. */
export interface MarketRow {
  drug: Drug;
  price: number;
  trend: PriceTrend;
  held: number;
  pressure: SupplyPressure;
}
