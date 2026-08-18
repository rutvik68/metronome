// rhythm.js
// Pure functions for turning (timeSignature, subdivision) into a flat
// sequence of note slots the audio engine and UI both consume.

export const SUBDIVISIONS = [
  { id: 'quarter', label: '♩', name: 'Quarter', count: 1 },
  { id: 'eighth', label: '♪♪', name: 'Eighth', count: 2 },
  { id: 'triplet', label: '♫³', name: 'Triplet', count: 3 },
  { id: 'sixteenth', label: '16th', name: 'Sixteenth', count: 4 },
];

const TEMPO_MARKINGS = [
  [20, 40, 'Grave'],
  [41, 55, 'Largo'],
  [56, 65, 'Adagio'],
  [66, 76, 'Andante'],
  [77, 108, 'Moderato'],
  [109, 120, 'Allegretto'],
  [121, 168, 'Allegro'],
  [169, 200, 'Presto'],
  [201, 300, 'Prestissimo'],
];

export function tempoName(bpm) {
  const hit = TEMPO_MARKINGS.find(([lo, hi]) => bpm >= lo && bpm <= hi);
  return hit ? hit[2] : '';
}

// Builds the full-cycle sequence for one measure.
// Each slot: { beatIndex, subIndex, isBeat, accent, muted, subdivisionCount }
// - beatIndex/subIndex identify position for the mute/accent pattern keys
// - isBeat marks the first subdivision of each beat (used for default accent + click timbre)
export function buildSequence(numerator, subdivisionId, accentPattern, mutePattern) {
  const sub = SUBDIVISIONS.find((s) => s.id === subdivisionId) || SUBDIVISIONS[0];
  const seq = [];
  for (let beat = 0; beat < numerator; beat++) {
    for (let s = 0; s < sub.count; s++) {
      const key = `${beat}-${s}`;
      const isBeat = s === 0;
      // Default: beat 1 of measure accented, nothing else, unless user overrode via accentPattern
      const defaultAccent = beat === 0 && isBeat;
      const accent = accentPattern.hasOwnProperty(key) ? accentPattern[key] : defaultAccent;
      const muted = !!mutePattern[key];
      seq.push({
        key,
        beatIndex: beat,
        subIndex: s,
        isBeat,
        accent,
        muted,
        subdivisionCount: sub.count,
      });
    }
  }
  return seq;
}

export const TIME_SIG_PRESETS = ['2/4', '3/4', '4/4', '5/4', '6/8', '7/8', '9/8', '12/8', '16/4'];

export function clampBpm(bpm) {
  return Math.min(300, Math.max(20, Math.round(bpm)));
}
