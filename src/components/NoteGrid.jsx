import { useEffect, useState } from 'react';

// NoteGrid renders one dot per sequence slot. Tap cycles nothing/accent by
// long-press... kept simple per spec: single tap = mute/unmute (core
// requirement). Accent is toggled via a small secondary control per beat
// (only shown on beat-start slots to avoid overwhelming subdivisions).
export default function NoteGrid({ sequence, currentStep, isPlaying, onToggleMute, onToggleAccent, showHint }) {
  const [hintVisible, setHintVisible] = useState(showHint);

  useEffect(() => setHintVisible(showHint), [showHint]);

  return (
    <div className="note-grid-wrap">
      {hintVisible && <div className="note-hint">Tap any note to mute/unmute</div>}
      <div className="note-grid" role="group" aria-label="Rhythm grid, tap to mute or unmute a note">
        {sequence.map((note, i) => {
          const active = isPlaying && currentStep === i;
          const classes = [
            'note-dot',
            note.isBeat ? 'note-dot--beat' : 'note-dot--sub',
            note.muted ? 'note-dot--muted' : '',
            note.accent && !note.muted ? 'note-dot--accent' : '',
            active ? 'note-dot--active' : '',
          ].join(' ');
          return (
            <button
              key={note.key}
              type="button"
              className={classes}
              aria-label={`Beat ${note.beatIndex + 1}${note.isBeat ? '' : ` subdivision ${note.subIndex + 1}`}, ${note.muted ? 'muted' : 'sounding'}${note.accent ? ', accented' : ''}. Tap to ${note.muted ? 'unmute' : 'mute'}.`}
              onClick={() => { onToggleMute(note.key); setHintVisible(false); }}
              onContextMenu={(e) => { e.preventDefault(); onToggleAccent(note.key); }}
              onDoubleClick={() => onToggleAccent(note.key)}
              title={note.isBeat ? 'Tap: mute/unmute · Double-tap: toggle accent' : 'Tap: mute/unmute'}
            >
              <span className="note-dot__inner">{note.muted ? '🔇' : ''}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
