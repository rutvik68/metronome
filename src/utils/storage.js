// storage.js - thin wrapper around localStorage with JSON + fallback safety

const KEY = 'metronome-settings-v1';

export const DEFAULT_SETTINGS = {
  bpm: 88,
  numerator: 4,
  denominator: 4,
  subdivision: 'quarter',
  volume: 0.8,
  muted: false,
  accentPattern: {},
  mutePattern: {},
  theme: 'dark',
  presets: [],
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable (private mode / quota) - fail silently
  }
}
