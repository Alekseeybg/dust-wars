import type { CargoLot, CargoLots, CargoGroup, DrugId } from 'types';
import { getDrug } from 'data/drugs';

/**
 * Total units held for a drug, summed across its lots.
 */
export function heldQty(lots: CargoLots, drugId: DrugId): number {
  const list = lots[drugId];
  if (!list) return 0;
  let total = 0;
  for (const lot of list) total += lot.qty;
  return total;
}

/** Total units held across all drugs. */
export function totalHeld(lots: CargoLots): number {
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
  lots: CargoLots,
  drugId: DrugId,
  qty: number,
  price: number,
  day: number,
): CargoLots {
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
  lots: CargoLots;
  /** Cost basis (dollars) of the units actually removed, under FIFO. */
  costRemoved: number;
}

/**
 * Remove qty from a drug, consuming lots oldest-first (FIFO). The
 * caller is responsible for validating that qty ≤ total held.
 */
export function removeLots(lots: CargoLots, drugId: DrugId, qty: number): RemoveResult {
  const list = lots[drugId] ?? [];
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

/** Group cargo in purchase order for the hold and its detail dialog. */
export function groupCargo(lots: CargoLots): CargoGroup[] {
  const groups: CargoGroup[] = [];
  for (const [id, batches] of Object.entries(lots)) {
    if (!batches?.length) continue;
    const drugId = id as DrugId;
    const drug = getDrug(drugId);
    groups.push({
      id: drugId,
      name: drug.name,
      swatch: drug.swatch,
      total: heldQty(lots, drugId),
      lots: batches,
    });
  }
  return groups;
}
