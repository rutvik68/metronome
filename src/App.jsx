import { useEffect, useMemo, useRef, useState } from 'react';
import { MetronomeEngine } from './audio/metronomeEngine';
import { buildSequence, clampBpm } from './utils/rhythm';
import { loadSettings, saveSettings } from './utils/storage';
import NoteGrid from './components/NoteGrid';
import TempoControl from './components/TempoControl';
import TimeSignature from './components/TimeSignature';
import TransportBar from './components/TransportBar';
import PresetBar from './components/PresetBar';
import './App.css';

export default function App() {
  const initial = useRef(loadSettings()).current;

  const [bpm, setBpm] = useState(initial.bpm);
  const [numerator, setNumerator] = useState(initial.numerator);
  const [denominator, setDenominator] = useState(initial.denominator);
  const [subdivision, setSubdivision] = useState(initial.subdivision);
  const [volume, setVolume] = useState(initial.volume);
  const [muted, setMuted] = useState(initial.muted);
  const [accentPattern, setAccentPattern] = useState(initial.accentPattern);
  const [mutePattern, setMutePattern] = useState(initial.mutePattern);
  const [presets, setPresets] = useState(initial.presets);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayStep, setDisplayStep] = useState(-1);
  const [showHint, setShowHint] = useState(true);

  const engineRef = useRef(null);
  const scheduledQueue = useRef([]); // {stepIndex, when} entries awaiting real playback
  const rafRef = useRef(null);

  const sequence = useMemo(
    () => buildSequence(numerator, subdivision, accentPattern, mutePattern),
    [numerator, subdivision, accentPattern, mutePattern]
  );

  // --- Engine lifecycle ---------------------------------------------
  useEffect(() => {
    const engine = new MetronomeEngine();
    engine.onStepScheduled = (stepIndex, when) => {
      scheduledQueue.current.push({ stepIndex, when });
    };
    engineRef.current = engine;
    return () => engine.dispose();
  }, []);

  // Keep engine's live parameters in sync without restarting playback
  useEffect(() => { engineRef.current?.setBpm(bpm); }, [bpm]);
  useEffect(() => { engineRef.current?.setSequence(sequence); }, [sequence]);
  useEffect(() => { engineRef.current?.setVolume(volume); }, [volume]);
  useEffect(() => { engineRef.current?.setMuted(muted); }, [muted]);

  // rAF loop: highlights the step whose scheduled audio time has actually
  // arrived (not merely been scheduled, which happens up to 100ms early).
  useEffect(() => {
    const tick = () => {
      const engine = engineRef.current;
      if (engine && engine.ctx) {
        const now = engine.ctx.currentTime;
        let latest = null;
        const q = scheduledQueue.current;
        while (q.length && q[0].when <= now) latest = q.shift();
        if (latest) setDisplayStep(latest.stepIndex);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // --- Persistence -----------------------------------------------------
  useEffect(() => {
    saveSettings({
      bpm, numerator, denominator, subdivision, volume, muted,
      accentPattern, mutePattern, theme: 'dark', presets,
    });
  }, [bpm, numerator, denominator, subdivision, volume, muted, accentPattern, mutePattern, presets]);

  // --- Transport ---------------------------------------------------
  const handlePlayPause = () => {
    const engine = engineRef.current;
    if (isPlaying) {
      engine.pause();
      setIsPlaying(false);
    } else {
      engine.start();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    engineRef.current?.stop();
    setIsPlaying(false);
    setDisplayStep(-1);
    scheduledQueue.current = [];
  };

  const handleReset = () => {
    handleStop();
    setBpm(88);
    setNumerator(4);
    setDenominator(4);
    setSubdivision('quarter');
    setVolume(0.8);
    setMuted(false);
    setAccentPattern({});
    setMutePattern({});
  };

  const handleResetRhythm = () => {
    setAccentPattern({});
    setMutePattern({});
  };

  // --- Rhythm grid editing -------------------------------------------
  const toggleMute = (key) => setMutePattern((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleAccent = (key) => {
    setAccentPattern((prev) => {
      const current = sequence.find((n) => n.key === key)?.accent;
      return { ...prev, [key]: !current };
    });
  };

  // --- Time signature / subdivision -----------------------------------
  const handleChangeSig = (n, d) => { setNumerator(n); setDenominator(d); };

  // --- Presets ---------------------------------------------------------
  const applyPreset = (p) => {
    setBpm(clampBpm(p.bpm));
    setNumerator(p.numerator);
    setDenominator(p.denominator);
    setSubdivision(p.subdivision);
    if (p.accentPattern) setAccentPattern(p.accentPattern);
    if (p.mutePattern) setMutePattern(p.mutePattern);
  };
  const saveCurrentPreset = () => {
    const name = window.prompt('Preset name?');
    if (!name) return;
    setPresets((prev) => [
      ...prev.filter((p) => p.name !== name),
      { name, bpm, numerator, denominator, subdivision, volume, accentPattern, mutePattern },
    ]);
  };
  const deletePreset = (name) => setPresets((prev) => prev.filter((p) => p.name !== name));

  // --- Keyboard shortcuts ----------------------------------------------
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setBpm((b) => clampBpm(b + 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setBpm((b) => clampBpm(b - 1));
          break;
        case 't':
        case 'T':
          // Tap tempo handled inside TempoControl; keyboard 'T' triggers same logic globally
          window.dispatchEvent(new CustomEvent('metronome:tap'));
          break;
        case 'm':
        case 'M':
          setMuted((m) => !m);
          break;
        case 'r':
        case 'R':
          handleReset();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>METRONOME</h1>
      </header>

      <main className="app-main">
        <TempoControl bpm={bpm} onChange={setBpm} />

        <NoteGrid
          sequence={sequence}
          currentStep={displayStep}
          isPlaying={isPlaying}
          onToggleMute={toggleMute}
          onToggleAccent={toggleAccent}
          showHint={showHint}
        />
        {showHint && (
          <button className="hint-dismiss" onClick={() => setShowHint(false)}>Got it</button>
        )}

        <TransportBar
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          volume={volume}
          onVolumeChange={setVolume}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
        />

        <TimeSignature
          numerator={numerator}
          denominator={denominator}
          subdivision={subdivision}
          onChangeSig={handleChangeSig}
          onChangeSubdivision={setSubdivision}
        />

        <PresetBar
          presets={presets}
          onApply={applyPreset}
          onSaveCurrent={saveCurrentPreset}
          onDelete={deletePreset}
        />

        <div className="reset-row">
          <button className="text-btn" onClick={handleResetRhythm}>Reset Rhythm</button>
          <button className="text-btn" onClick={handleReset}>Reset All</button>
        </div>
      </main>
    </div>
  );
}
