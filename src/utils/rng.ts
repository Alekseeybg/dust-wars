/**
 * Mulberry32 — seedable 32-bit PRNG.
 *
 * Deterministic: the same seed yields the same sequence. A save file
 * only needs to store the seed plus the number of draws consumed,
 * not the resulting state.
 */
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randInt = (rng: () => number, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

export const pick = <T>(rng: () => number, arr: readonly T[]): T =>
  arr[Math.floor(rng() * arr.length)]!;

export const chance = (rng: () => number, p: number) => rng() < p;
