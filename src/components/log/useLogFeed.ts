import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { LogEntry } from 'types';
import { logCategory } from 'domain/log';
import type { LogFilter } from './types';

/** Shared selection for the preview, full log, and filtered entry counts. */
export function useLogFeed(
  entries: MaybeRefOrGetter<readonly LogEntry[]>,
  filter: MaybeRefOrGetter<LogFilter>,
  limit?: MaybeRefOrGetter<number | undefined>,
) {
  const counts = computed(() => {
    const source = toValue(entries);
    const result = { all: source.length, trade: 0, event: 0 };
    for (const entry of source) result[logCategory(entry)] += 1;
    return result;
  });

  const matchingEntries = computed(() => {
    const selected = toValue(filter);
    return toValue(entries).filter(
      (entry) => selected === 'all' || logCategory(entry) === selected,
    );
  });

  const visibleEntries = computed(() => {
    const source = matchingEntries.value;
    const maxEntries = toValue(limit);
    return (maxEntries ? source.slice(-maxEntries) : source.slice()).reverse();
  });

  return { counts, matchingEntries, visibleEntries };
}
