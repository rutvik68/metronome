export default function TransportBar({ isPlaying, onPlayPause, onStop, volume, onVolumeChange, muted, onToggleMute }) {
  return (
    <div className="transport-bar">
      <div className="volume-control">
        <button
          className="icon-btn"
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
          aria-pressed={muted}
        >
          {muted ? '🔈' : '🔊'}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          aria-label="Volume"
          className="volume-slider"
        />
      </div>

      <button
        className={`play-btn ${isPlaying ? 'play-btn--playing' : ''}`}
        onClick={onPlayPause}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '❚❚' : '▶'}
      </button>

      <button className="icon-btn stop-btn" onClick={onStop} aria-label="Stop and reset to beat one">
        ■
      </button>
    </div>
  );
}
