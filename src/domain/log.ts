import type { LogSegment, MarketPrices } from 'types';
import { DRUGS } from 'data/drugs';

export const logSegment = (text: string, opts: Omit<LogSegment, 'text'> = {}): LogSegment => ({
  text,
  ...opts,
});

export function epochMovementSegments(prev: MarketPrices, next: MarketPrices): LogSegment[] {
  const risers: { name: string; delta: number }[] = [];
  const fallers: { name: string; delta: number }[] = [];

  for (const drug of DRUGS) {
    const delta = next.prices[drug.id] - prev.prices[drug.id];
    if (delta > 0) risers.push({ name: drug.name, delta });
    else if (delta < 0) fallers.push({ name: drug.name, delta: -delta });
  }

  risers.sort((a, b) => b.delta - a.delta);
  fallers.sort((a, b) => b.delta - a.delta);

  if (!risers.length && !fallers.length) {
    return [logSegment('Prices hold steady.')];
  }

  const segments: LogSegment[] = [logSegment('Prices shift — ')];

  risers.slice(0, 3).forEach((r, i) => {
    if (i > 0) segments.push(logSegment(', '));
    segments.push(logSegment(`↑ ${r.name} +$${r.delta}`, { color: 'wine-soft' }));
  });

  if (risers.length && fallers.length) segments.push(logSegment('   '));

  fallers.slice(0, 3).forEach((f, i) => {
    if (i > 0) segments.push(logSegment(', '));
    segments.push(logSegment(`↓ ${f.name} −$${f.delta}`, { color: 'forest-soft' }));
  });

  return segments;
}
