import type { Drug, DrugId } from 'types';

/**
 * Drug roster.
 *
 * Order matters — it drives display order in the market table. Sorted by
 * base price ascending: cheap/common drugs at the top, rare/expensive at
 * the bottom. The player's progression naturally walks down the list.
 *
 * swatch colours are intentionally muted to sit inside the dim-gold
 * palette; they hint at the drug's real-world appearance without
 * shouting.
 */
export const DRUGS: Drug[] = [
  {
    id: 'weed',
    name: 'Weed',
    tier: 'common',
    base: 12,
    vol: 0.2,
    swatch: '#3d5a30',
    description: 'Cheap, abundant, low margin. Where every dealer starts.',
  },
  {
    id: 'hash',
    name: 'Hash',
    tier: 'common',
    base: 18,
    vol: 0.2,
    swatch: '#6b4a28',
    description: 'Concentrated cannabis resin. Denser, pricier, easier to move.',
  },
  {
    id: 'speed',
    name: 'Speed',
    tier: 'common',
    base: 15,
    vol: 0.22,
    swatch: '#8a8a80',
    description: 'Amphetamine powder. Cheap stimulant, steady demand.',
  },
  {
    id: 'shrooms',
    name: 'Shrooms',
    tier: 'uncommon',
    base: 22,
    vol: 0.28,
    swatch: '#7a6a4a',
    description: 'Psilocybin mushrooms. Seasonal, unpredictable, occasionally valuable.',
  },
  {
    id: 'acid',
    name: 'Acid',
    tier: 'uncommon',
    base: 28,
    vol: 0.3,
    swatch: '#6a5a90',
    description: 'LSD blotter. Small, potent, high markup per gram.',
  },
  {
    id: 'oxy',
    name: 'Oxy',
    tier: 'uncommon',
    base: 45,
    vol: 0.32,
    swatch: '#5a6a7a',
    description: 'Oxycodone pills. Prescription opioid — steady demand, rising heat.',
  },
  {
    id: 'opium',
    name: 'Opium',
    tier: 'rare',
    base: 60,
    vol: 0.32,
    swatch: '#4a3525',
    description: 'Raw opium. The base of the opioid trade.',
  },
  {
    id: 'coke',
    name: 'Coke',
    tier: 'rare',
    base: 90,
    vol: 0.35,
    swatch: '#b8b0a0',
    description: 'Cocaine. High margin, high risk, always wanted.',
  },
  {
    id: 'heroin',
    name: 'Heroin',
    tier: 'rare',
    base: 120,
    vol: 0.4,
    swatch: '#8a7255',
    description: "Heroin. Heavy money, heavy heat. The loan shark's favourite.",
  },
  {
    id: 'fentanyl',
    name: 'Fentanyl',
    tier: 'rare',
    base: 150,
    vol: 0.48,
    swatch: '#7a3545',
    description: 'Fentanyl. Tiny doses, lethal margins, maximum danger.',
  },
];

export const DRUG_BY_ID = new Map<DrugId, Drug>(DRUGS.map((d) => [d.id, d]));

export function getDrug(id: DrugId): Drug {
  const drug = DRUG_BY_ID.get(id);
  if (!drug) throw new Error(`Unknown drug: ${id}`);
  return drug;
}
