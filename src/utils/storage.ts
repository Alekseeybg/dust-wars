import type { GameState } from 'types';

const SAVE_KEY = 'dust-wars:save';
const SAVE_VERSION = 3;

interface SaveFile {
  version: number;
  state: GameState;
}

export function saveGame(state: GameState): void {
  try {
    const payload: SaveFile = { version: SAVE_VERSION, state };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('[dust-wars] save failed', err);
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveFile;
    if (parsed.version !== SAVE_VERSION) {
      console.info('[dust-wars] save version mismatch, starting fresh');
      return null;
    }
    return parsed.state;
  } catch (err) {
    console.warn('[dust-wars] load failed', err);
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    console.warn('[dust-wars] clear failed', err);
  }
}
