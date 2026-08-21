# Overview

The Vital.kit splash screen, built with Vite (vanilla JS - no UI framework).

No runtime dependencies at all - only Vite and the single-file plugin as dev dependencies. The shipped output is a single static HTML file (`build/index.html`) with everything inlined, so it works offline, works via `file://`, and never breaks due to a CDN outage or version drift. This is the file Godot's WebView loads, per `manifest.json` (`"source": "build/index.html"`).

The screen draws the Vital.sandbox logo and Godot logo in sequence as animated SVG strokes (`app/icons.js`, `app/animation.js`), layers in scanline/vignette/flicker/flash effects (`app/effects.js`), then fades out and tells Godot it's safe to hide the splash. Timings and stroke widths are centralized as named constants in `app/config.js`.

## Setup

```
npm install
```

## Development

```
npm run dev
```

Opens a local dev server (default `http://localhost:5173`) with hot reload.

`app/main.js` stubs Godot's `ipc` object and fires a fake `init` event, so the full animation runs without Godot present. It also serves `/kit`, bundling `../../js/manifest.json`'s sources for testing against the real kit code. Both are dev-only and stripped via `import.meta.env.DEV`.

In production, Godot sends `init` when ready to show the splash; the splash sends `ready` (on load) and `hide` (after the exit animation, via `splash:hide`) back over `ipc.postMessage`.

## Production

```
npm run build
```

Outputs `../build/index.html`, ready to drop into Godot's WebView. Dev-only code (`ipc` stub, `/kit` fetch) is stripped automatically.

## Preview

```
npm run preview
```

Serves the production build locally so it can be checked before shipping. In a plain browser preview, the real `ready`/`hide` `ipc.postMessage` calls will throw unless something on the page defines `window.ipc` - check the console rather than expecting Godot-side behaviour.

## Tuning the animation

All timing and stroke widths live in `app/config.js` as named constants (`START_DELAY`, `STROKE_SPEED`, `STROKE_WIDTH_VITAL`/`STROKE_WIDTH_GODOT`, `HOLD_VITAL`/`HOLD_GODOT`, `GAP_GLITCH`, `FADE_TO_BLACK`, `BLACK_HOLD_DELAY`, `FADE_TO_TRANSPARENT`) - adjust these rather than editing values inside `app/animation.js`. The Godot logo's jaw path carries an internal SVG matrix transform (scale factor `4.162611`, in `app/main.js`), so its stroke width derives from `STROKE_WIDTH_GODOT` rather than being set independently - keep that in mind if the jaw stroke looks mismatched after a width change.
