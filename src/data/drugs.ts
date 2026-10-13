import type { Drug, DrugId } from 'types';

/**
 * Drug roster.
 *
 * Order matters — it drives display order in the market table, with
 * cheap/common drugs at the top and rare/expensive drugs at the bottom.
 *
 * swatch colours are intentionally muted to sit inside the dim-gold
 * palette; they hint at the drug's real-world appearance without
 * shouting.
 */
export const DRUGS: readonly Drug[] = [
  {
    id: 'weed',
    name: 'Weed',
    tier: 'common',
    basePrice: 12,
    volatility: 0.2,
    swatch: '#3d5a30',
    description: 'Cheap, abundant, low margin. Where every dealer starts.',
  },
  {
    id: 'hash',
    name: 'Hash',
    tier: 'common',
    basePrice: 18,
    volatility: 0.2,
    swatch: '#6b4a28',
    description: 'Concentrated cannabis resin. Denser, pricier, easier to move.',
  },
  {
    id: 'speed',
    name: 'Speed',
    tier: 'common',
    basePrice: 15,
    volatility: 0.22,
    swatch: '#8a8a80',
    description: 'Amphetamine powder. Cheap stimulant, steady demand.',
  },
  {
    id: 'shrooms',
    name: 'Shrooms',
    tier: 'uncommon',
    basePrice: 22,
    volatility: 0.28,
    swatch: '#7a6a4a',
    description: 'Psilocybin mushrooms. Seasonal, unpredictable, occasionally valuable.',
  },
  {
    id: 'acid',
    name: 'Acid',
    tier: 'uncommon',
    basePrice: 28,
    volatility: 0.3,
    swatch: '#6a5a90',
    description: 'LSD blotter. Small, potent, high markup per gram.',
  },
  {
    id: 'oxy',
    name: 'Oxy',
    tier: 'uncommon',
    basePrice: 45,
    volatility: 0.32,
    swatch: '#5a6a7a',
    description: 'Oxycodone pills. Prescription opioid — steady demand, rising heat.',
  },
  {
    id: 'opium',
    name: 'Opium',
    tier: 'rare',
    basePrice: 60,
    volatility: 0.32,
    swatch: '#4a3525',
    description: 'Raw opium. The base of the opioid trade.',
  },
  {
    id: 'coke',
    name: 'Coke',
    tier: 'rare',
    basePrice: 90,
    volatility: 0.35,
    swatch: '#b8b0a0',
    description: 'Cocaine. High margin, high risk, always wanted.',
  },
  {
    id: 'heroin',
    name: 'Heroin',
    tier: 'rare',
    basePrice: 120,
    volatility: 0.4,
    swatch: '#8a7255',
    description: "Heroin. Heavy money, heavy heat. The loan shark's favourite.",
  },
  {
    id: 'fentanyl',
    name: 'Fentanyl',
    tier: 'rare',
    basePrice: 150,
    volatility: 0.48,
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
