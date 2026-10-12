import type { Drug, DrugId } from 'types';

export const DRUGS: Drug[] = [
  { id: 'weed', name: 'Weed', tier: 'common', base: 45, vol: 0.18, swatch: '#4a5f36' },
  { id: 'hash', name: 'Hash', tier: 'common', base: 90, vol: 0.18, swatch: '#5a4128' },
  { id: 'ludes', name: 'Ludes', tier: 'common', base: 70, vol: 0.2, swatch: '#544a3c' },
  { id: 'speed', name: 'Speed', tier: 'common', base: 120, vol: 0.22, swatch: '#635c46' },
  { id: 'shrooms', name: 'Shrooms', tier: 'uncommon', base: 180, vol: 0.28, swatch: '#5f5a40' },
  { id: 'acid', name: 'Acid', tier: 'uncommon', base: 320, vol: 0.3, swatch: '#5b4d82' },
  { id: 'opium', name: 'Opium', tier: 'rare', base: 620, vol: 0.35, swatch: '#6a4258' },
  { id: 'coke', name: 'Coke', tier: 'rare', base: 850, vol: 0.38, swatch: '#7d3a3a' },
  { id: 'fentanyl', name: 'Fentanyl', tier: 'rare', base: 1400, vol: 0.48, swatch: '#733e63' },
];

export const DRUG_BY_ID = new Map<DrugId, Drug>(DRUGS.map((d) => [d.id, d]));

export function getDrug(id: DrugId): Drug {
  const drug = DRUG_BY_ID.get(id);
  if (!drug) throw new Error(`Unknown drug: ${id}`);
  return drug;
}
