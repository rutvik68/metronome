# Metronome

A precise, professional web metronome for musicians — BPM control, unusual
time signatures, subdivisions, per-note mute, custom accents, and tap tempo.
100% static, runs entirely in the browser, free to deploy on GitHub Pages.

## Features

- BPM 20–300 with slider, +/- (long-press repeat), direct numeric entry, and tap tempo
- Time signatures: any numerator 1–16 over 2/4/8/16, plus quick presets (2/4 … 16/4)
- Subdivisions: quarter, eighth, eighth-note triplet, sixteenth
- **Per-note mute/unmute** — tap any dot in the rhythm grid; muted notes keep
  their exact timing slot (silent, not skipped)
- **Custom accents** — double-tap (or right-click) a beat to accent it
- Distinct accent / beat / subdivision click timbres, synthesized live with
  the Web Audio API (no audio files)
- Look-ahead scheduler for drift-free timing (not `setInterval`-driven)
- Play / Pause / Stop / Reset / Reset Rhythm
- Volume + mute
- Built-in presets (Slow Practice, Walking, Jazz, Rock, Fast Practice) + save your own
- Settings persist via `localStorage`
- Keyboard shortcuts, ARIA labels, large touch targets
- Installable PWA (manifest + service worker)
- Mobile-first responsive layout (360px up to desktop)

## Tech stack

React 18 + Vite + vanilla CSS + Web Audio API. No backend, no database, no
paid services, no external audio files.

## Installation / local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview   # optional: preview the production build locally
```

Output goes to `dist/`.

## Deploying to GitHub Pages

1. Create a new GitHub repo named `metronome` (or update `base` in
   `vite.config.js` and `start_url`/`scope` in `public/manifest.json` to match
   whatever name you use).
2. Push this project to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/metronome.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
4. The included workflow (`.github/workflows/deploy.yml`) builds and deploys
   automatically on every push to `main`. Watch progress under the **Actions**
   tab.
5. Your app will be live at:
   ```
   https://USERNAME.github.io/metronome/
   ```

## Keyboard shortcuts

| Key | Action |
|---|---|
| Space | Play / Pause |
| ↑ | BPM +1 |
| ↓ | BPM −1 |
| T | Tap tempo |
| M | Mute / unmute audio |
| R | Reset all |

## Using per-note mute & accents

- **Tap** a dot in the rhythm grid to mute/unmute it. Muted notes stay
  visible (shown with 🔇) and still highlight in sync when the beat reaches
  them — they just produce no sound. Timing is never altered.
- **Double-tap** (or right-click on desktop) a beat-start dot to toggle a
  custom accent on it. A note can be both accented and muted; if muted it
  stays silent regardless of accent state.
- Use **Reset Rhythm** to clear all mute/accent edits without touching tempo
  or time signature.

## Troubleshooting

- **No sound on first play**: browsers block audio until a user gesture;
  press Play once and audio will initialize.
- **404 / blank page after deploying**: confirm `base` in `vite.config.js`
  matches your repo name exactly (including case), and that Pages source is
  set to "GitHub Actions".
- **Settings not saving**: some browsers block `localStorage` in private/
  incognito mode — this is expected; the app still works, just without
  persistence.
- **PWA install option missing**: PWA install prompts only appear on the
  deployed HTTPS site (GitHub Pages), not on `localhost` in some browsers,
  and only after the service worker has registered on a prior visit.
