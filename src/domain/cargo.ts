import type { CargoLot, DrugId } from 'types';

/**
 * Total units held for a drug, summed across its lots.
 */
export function heldQty(lots: Partial<Record<DrugId, CargoLot[]>>, drugId: DrugId): number {
  const list = lots[drugId];
  if (!list) return 0;
  let total = 0;
  for (const lot of list) total += lot.qty;
  return total;
}

/** Total units held across all drugs. */
export function totalHeld(lots: Partial<Record<DrugId, CargoLot[]>>): number {
  let total = 0;
  for (const list of Object.values(lots)) {
    if (!list) continue;
    for (const lot of list) total += lot.qty;
  }
  return total;
}

/**
 * Append a purchase lot. Consecutive lots at the same price on the same
 * day are merged to keep the cargo view tidy — but lots from different
 * days or different prices stay separate so the player sees the batches.
 */
export function addLot(
  lots: Partial<Record<DrugId, CargoLot[]>>,
  drugId: DrugId,
  qty: number,
  price: number,
  day: number,
): Partial<Record<DrugId, CargoLot[]>> {
  const list = [...(lots[drugId] ?? [])];
  const last = list[list.length - 1];

  if (last && last.price === price && last.day === day) {
    list[list.length - 1] = { ...last, qty: last.qty + qty };
  } else {
    list.push({ qty, price, day });
  }

  return { ...lots, [drugId]: list };
}

export interface RemoveResult {
  lots: Partial<Record<DrugId, CargoLot[]>>;
  /** Cost basis (dollars) of the units actually removed, under FIFO. */
  costRemoved: number;
}

/**
 * Remove qty from a drug, consuming lots oldest-first (FIFO). The
 * caller is responsible for validating that qty ≤ total held.
 */
export function removeLots(
  lots: Partial<Record<DrugId, CargoLot[]>>,
  drugId: DrugId,
  qty: number,
): RemoveResult {
  const list = [...(lots[drugId] ?? [])];
  let remaining = qty;
  let costRemoved = 0;
  const kept: CargoLot[] = [];

  for (const lot of list) {
    if (remaining <= 0) {
      kept.push(lot);
      continue;
    }
    if (lot.qty <= remaining) {
      costRemoved += lot.qty * lot.price;
      remaining -= lot.qty;
      // lot fully consumed, not pushed
    } else {
      // partial consume of this lot
      costRemoved += remaining * lot.price;
      kept.push({ ...lot, qty: lot.qty - remaining });
      remaining = 0;
    }
  }

  const next = { ...lots };
  if (kept.length) next[drugId] = kept;
  else delete next[drugId];

  return { lots: next, costRemoved };
}
