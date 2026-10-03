# Overview

The Vital.kit splash screen, built with Vite (vanilla JS - no UI framework).

No runtime dependencies at all - only Vite and the single-file plugin as dev dependencies. The shipped output is a single static HTML file (`build/index.html`) with the markup, logo geometry, script and splash-specific CSS inlined. This is the file Godot's WebView loads, per `manifest.json` (`"source": "build/index.html"`).

The look is shared with the site rather than copied from it. The page links two stylesheets from `vital-sandbox.com/cdn` (published by Vital.site's `shared/sync.js`):

- `theme.css` - the colour tokens
- `ui/brand/index.css` - the neon logo treatment and `is-glitch` flicker state, as used by the site hero's `<Brand neon flicker />`

So the splash picks up site restyles without a kit release. If the CDN is unreachable, `app/index.css` falls back to the plain brand colours (zero-specificity `:where(:root)` defaults, so the CDN always wins when present): the logo still draws and the splash still hides on time, just without the neon glow.

The sequence (`app/animation.js`) is a single phase: the logo draws as animated SVG strokes, stutters like a warming neon tube, then ignites (flash, ripples, punch). After a short hold it fades through black to transparent and tells Godot it's safe to hide the splash. Timings and the stroke width are centralized as named constants in `app/config.js`; `app/effects.js` holds the glitch/flash/ripple helpers.

The logo polygons in `index.html` are identical to `Vital.site/frontend/public/logo/logo.svg`. They are inlined (and defined once, drawn twice via `<use>`) because the draw-on animation needs the individual shapes and `/logo` is not served with CORS headers, so it can't be fetched at runtime.

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
