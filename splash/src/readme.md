# Overview

The Vital.kit splash screen, built with Vite (vanilla JS, no UI framework). No runtime dependencies.

The shipped output is a single static HTML file (`build/index.html`) with markup, logo geometry, script and splash CSS inlined. Godot's WebView loads it via `manifest.json` (`"source": "build/index.html"`).

Shared styles are linked from `vital-sandbox.com/cdn`:

- `theme.css` - colour tokens
- `ui/brand/index.css` - neon logo treatment and `is-glitch` flicker state

Sequence (`app/animation.js`): the logo draws as SVG strokes, flickers like a neon tube, ignites, holds briefly, then fades to transparent and tells Godot it's safe to hide the splash. Timings and stroke width are constants in `app/config.js`; glitch/flash/ripple helpers are in `app/effects.js`.

## Setup

```
npm install
```

## Development

```
npm run dev
```

Starts a dev server (default `http://localhost:5173`) with hot reload. `app/main.js` stubs Godot's `ipc` and fires a fake `init` event, so the animation runs without Godot. Dev-only code is stripped from production builds.

In production, Godot sends `init`; the splash sends `ready` (on load) and `hide` (after the exit animation) via `ipc.postMessage`.

## Production

```
npm run build
```

Outputs `../build/index.html`.

## Preview

```
npm run preview
```

Serves the production build locally. Without Godot, `ipc.postMessage` calls throw unless `window.ipc` is defined; check the console.
