// metronomeEngine.js
// Core audio engine. Uses a look-ahead scheduler (the standard robust pattern
// for Web Audio timing, popularized by Chris Wilson's "A Tale of Two Clocks")
// instead of setInterval as the timing source. setInterval drifts because it
// rides on the JS event loop; here we only use a timer to periodically check
// AudioContext.currentTime (a hardware clock) and schedule sounds slightly
// ahead of it via precise AudioParam/start() timestamps.

const LOOKAHEAD_MS = 25;       // how often we poll to schedule new notes
const SCHEDULE_AHEAD_SEC = 0.1; // how far ahead (audio-clock time) we schedule

export class MetronomeEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.timerId = null;

    this.bpm = 88;
    this.volume = 0.8;
    this.muted = false;

    // sequence = array of { accent: bool, muted: bool } for the FULL cycle
    // (all beats * subdivision count), rebuilt whenever time signature or
    // subdivision changes.
    this.sequence = [];
    this.currentStep = 0;
    this.nextNoteTime = 0; // audio-clock time (seconds) of the next scheduled step

    // Called with (stepIndex, when-in-seconds) right as a step is scheduled,
    // so the UI can animate in sync via requestAnimationFrame against ctx time.
    this.onStepScheduled = null;
  }

  // AudioContext must be created/resumed from a user gesture (browser policy)
  ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  setVolume(v) {
    this.volume = v;
    if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : v;
  }

  setMuted(m) {
    this.muted = m;
    if (this.masterGain) this.masterGain.gain.value = m ? 0 : this.volume;
  }

  setBpm(bpm) {
    this.bpm = bpm;
  }

  setSequence(sequence) {
    // Swap sequence live; clamp currentStep so we don't index out of range
    // if the new sequence is shorter (e.g. time signature shrank).
    this.sequence = sequence;
    if (this.currentStep >= sequence.length) this.currentStep = 0;
  }

  // --- Sound synthesis -----------------------------------------------
  // Three distinct programmatic click timbres, no audio files required.
  _playTone(when, freq, duration, gainValue) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, when);
    // Fast attack, exponential-ish decay envelope for a crisp "click" feel
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(gainValue, when + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(when);
    osc.stop(when + duration + 0.01);
  }

  accentClick(when) { this._playTone(when, 1500, 0.06, 1.0); }
  beatClick(when) { this._playTone(when, 1000, 0.05, 0.7); }
  subdivisionClick(when) { this._playTone(when, 700, 0.035, 0.45); }

  // --- Scheduler -------------------------------------------------------
  scheduler = () => {
    // Schedule every note whose time falls within the look-ahead window.
    while (this.nextNoteTime < this.ctx.currentTime + SCHEDULE_AHEAD_SEC) {
      this._scheduleStep(this.currentStep, this.nextNoteTime);
      this._advanceStep();
    }
    this.timerId = window.setTimeout(this.scheduler, LOOKAHEAD_MS);
  };

  _scheduleStep(stepIndex, when) {
    const note = this.sequence[stepIndex];
    if (!note) return;

    // Muted notes still occupy their exact scheduled time slot - we simply
    // skip sound synthesis. Timing/advancement logic is untouched.
    if (!note.muted) {
      if (note.accent) this.accentClick(when);
      else if (note.isBeat) this.beatClick(when);
      else this.subdivisionClick(when);
    }

    if (this.onStepScheduled) this.onStepScheduled(stepIndex, when);
  }

  _advanceStep() {
    const stepDuration = this._currentStepDuration();
    this.nextNoteTime += stepDuration;
    this.currentStep = (this.currentStep + 1) % Math.max(this.sequence.length, 1);
  }

  // Each step's duration = secondsPerBeat / subdivisionCount for that step.
  // subdivisionCount is embedded per-note so mixed meters (e.g. 6/8 treated
  // as 2 dotted-quarter beats of 3 eighths) still compute correctly.
  _currentStepDuration() {
    const note = this.sequence[this.currentStep];
    const subCount = (note && note.subdivisionCount) || 1;
    const secondsPerBeat = 60 / this.bpm;
    return secondsPerBeat / subCount;
  }

  start() {
    if (this.isPlaying) return;
    this.ensureContext();
    this.isPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.scheduler();
  }

  pause() {
    this.isPlaying = false;
    if (this.timerId) window.clearTimeout(this.timerId);
    this.timerId = null;
  }

  stop() {
    this.pause();
    this.currentStep = 0;
  }

  dispose() {
    this.pause();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
