const BUILT_IN = [
  { name: 'Slow Practice', bpm: 60, numerator: 4, denominator: 4, subdivision: 'quarter' },
  { name: 'Walking', bpm: 90, numerator: 4, denominator: 4, subdivision: 'quarter' },
  { name: 'Jazz', bpm: 132, numerator: 4, denominator: 4, subdivision: 'triplet' },
  { name: 'Rock', bpm: 120, numerator: 4, denominator: 4, subdivision: 'eighth' },
  { name: 'Fast Practice', bpm: 180, numerator: 4, denominator: 4, subdivision: 'sixteenth' },
];

export default function PresetBar({ presets, onApply, onSaveCurrent, onDelete }) {
  return (
    <div className="preset-bar">
      <div className="preset-label">PRESETS</div>
      <div className="preset-list">
        {BUILT_IN.map((p) => (
          <button key={p.name} className="chip chip--preset" onClick={() => onApply(p)}>
            {p.name}
          </button>
        ))}
        {presets.map((p) => (
          <span key={p.name} className="chip chip--preset chip--user">
            <button onClick={() => onApply(p)}>{p.name}</button>
            <button className="chip__x" onClick={() => onDelete(p.name)} aria-label={`Delete preset ${p.name}`}>×</button>
          </span>
        ))}
        <button className="chip chip--save" onClick={onSaveCurrent}>+ Save current</button>
      </div>
    </div>
  );
}
