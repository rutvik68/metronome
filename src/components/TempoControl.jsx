import { useEffect, useRef, useState } from 'react';
import { clampBpm, tempoName } from '../utils/rhythm';

const TAP_RESET_MS = 2500;
const TAP_MAX_SAMPLES = 5;

export default function TempoControl({ bpm, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(bpm));
  const tapTimes = useRef([]);
  const holdTimer = useRef(null);

  // Long-press support (repeat +/-1 every 90ms after 400ms delay). Since bpm
  // arrives as a prop (not local state), we track the latest value in a ref
  // so the setTimeout loop always reads the current tempo, not a stale one.
  const liveBpm = useRef(bpm);
  liveBpm.current = bpm;

  const pressStart = (delta) => {
    onChange(clampBpm(liveBpm.current + delta));
    holdTimer.current = setTimeout(function tick() {
      onChange(clampBpm(liveBpm.current + delta));
      holdTimer.current = setTimeout(tick, 90);
    }, 400);
  };
  const pressEnd = () => {
    clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  const handleTap = () => {
    const now = performance.now();
    const arr = tapTimes.current;
    if (arr.length && now - arr[arr.length - 1] > TAP_RESET_MS) arr.length = 0;
    arr.push(now);
    if (arr.length > TAP_MAX_SAMPLES) arr.shift();
    if (arr.length >= 2) {
      const intervals = [];
      for (let i = 1; i < arr.length; i++) intervals.push(arr[i] - arr[i - 1]);
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      onChange(clampBpm(60000 / avgMs));
    }
  };

  // The 'T' keyboard shortcut is handled globally in App.jsx (so it works
  // regardless of focus) and dispatched as a custom event here.
  useEffect(() => {
    window.addEventListener('metronome:tap', handleTap);
    return () => window.removeEventListener('metronome:tap', handleTap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitDraft = () => {
    const n = parseInt(draft, 10);
    if (!Number.isNaN(n)) onChange(clampBpm(n));
    setEditing(false);
  };

  return (
    <div className="tempo-control">
      <div className="tempo-display">
        {editing ? (
          <input
            className="bpm-input"
            type="number"
            min={20}
            max={300}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={submitDraft}
            onKeyDown={(e) => { if (e.key === 'Enter') submitDraft(); }}
            aria-label="Enter BPM directly"
          />
        ) : (
          <button
            className="bpm-number"
            onClick={() => { setDraft(String(bpm)); setEditing(true); }}
            aria-label={`Tempo ${bpm} beats per minute. Tap to enter a value.`}
          >
            {bpm}
          </button>
        )}
        <div className="bpm-unit">BPM</div>
        <div className="tempo-name">{tempoName(bpm)}</div>
      </div>

      <div className="tempo-row">
        <button
          className="bpm-btn"
          aria-label="Decrease tempo"
          onPointerDown={() => pressStart(-1)}
          onPointerUp={pressEnd}
          onPointerLeave={pressEnd}
        >−</button>

        <input
          className="bpm-slider"
          type="range"
          min={20}
          max={300}
          value={bpm}
          onChange={(e) => onChange(clampBpm(Number(e.target.value)))}
          aria-label="Tempo slider"
        />

        <button
          className="bpm-btn"
          aria-label="Increase tempo"
          onPointerDown={() => pressStart(1)}
          onPointerUp={pressEnd}
          onPointerLeave={pressEnd}
        >+</button>
      </div>

      <button className="tap-tempo-btn" onClick={handleTap} aria-label="Tap tempo">
        TAP
      </button>
    </div>
  );
}
