# Overview

The Vital.kit splash screen, built with Vite (vanilla JS - no React/UI framework).

No CDN dependency anywhere - the build has no runtime dependencies at all beyond the browser itself, only Vite and the single-file plugin as dev dependencies.
The shipped output is a single static HTML file (`build/index.html`) with everything inlined - CSS and JS included - so it works offline, works via `file://`, and never breaks due to a CDN outage or version drift. This is the file Godot's WebView loads, per `manifest.json` (`"source": "build/index.html"`).

The screen draws the Vital.sandbox logo and Godot logo in sequence as animated SVG strokes (`app/icons.js`, `app/animation.js`), layers in scanline/vignette/flicker/flash effects (`app/effects.js`), then fades out and tells Godot it's safe to hide the splash. Timings (hold durations, fade lengths, stroke speed, stroke widths) are centralized as named constants in `app/config.js`.

## Setup

```
npm install
```

## Development

```
npm run dev
```

Opens a local dev server (default `http://localhost:5173`) with hot reload.

While in dev mode, `app/main.js` stubs the `ipc` object that Godot normally injects and dispatches a fake `init` event after a 1ms delay, so the animation runs and you can see the full sequence without Godot running. This relies on `import.meta.env.DEV`, which Vite's dev server sets to `true` and its production build statically strips out - so none of this stub code ships.

Dev mode also serves `/kit`, a small Vite middleware defined in `vite.config.js` that concatenates the source files listed in `../../js/manifest.json` (relative to the `sandbox` module's Lua/JS kit) into one script and serves it live, so the splash screen can be tested against the same kit code that ships alongside it.

In production, the real Godot host sends the `init` event once it's ready to show the splash, and the splash screen sends `ready` (on load) and `hide` (once the exit animation finishes, via the `splash:hide` window event) back over `ipc.postMessage`.

## Production

```
npm run build
```

Outputs a single self-contained file: `../build/index.html`. It has no external dependencies (no CDN, no separate JS/CSS files to keep in sync) and no dev-only stub code - `import.meta.env.DEV` is `false`, so the `/kit` fetch and `ipc` stub are dead-code-eliminated at build time.

To preview the production build locally before shipping it:

```
npm run preview
```

Note that in a plain browser preview the real `ready`/`hide` `ipc.postMessage` calls will throw unless something on the page defines `window.ipc` - check the console rather than expecting Godot-side behaviour.

## Tuning the animation

All timing and stroke widths live in `app/config.js` as named constants (`START_DELAY`, `STROKE_SPEED`, `STROKE_WIDTH_VITAL`/`STROKE_WIDTH_GODOT`, `HOLD_VITAL`/`HOLD_GODOT`, `GAP_GLITCH`, `FADE_TO_BLACK`, `BLACK_HOLD_DELAY`, `FADE_TO_TRANSPARENT`) - adjust these rather than editing magic numbers inside `app/animation.js`. Note the Godot logo's jaw path carries an internal SVG matrix transform (scale factor `4.162611`, defined in `app/main.js`), so its stroke width is derived from `STROKE_WIDTH_GODOT` rather than set independently - keep that in mind if the jaw stroke looks mismatched after a width change.

## Updating theme.css

`app/index.css` pulls a small number of variables (`--bg4`, `--blue`, `--b10`, `--b60`, `--len`) from a shared `theme.css` used across Vital.kit's UI modules and the Vital.site documentation site, rather than defining them locally. This file is not checked into this repo.

If the site's palette changes, copy the updated [`theme.css`](https://github.com/ov-studio/Vital.site/blob/main/app/theme.css) into `app/` here and run `npm run build` again - `index.css` references its variables directly, so no other changes are needed.

## Browser/WebView compatibility

The build targets `es2022` (see `build.target` in `vite.config.js`), which is supported by all native WebView backends in current use (WebView2/Chromium on Windows, WebKitGTK on Linux, WKWebView on macOS) as of any reasonably recent OS.

This was deliberately set conservative rather than relying on Vite's newer default targets, since the splash screen renders inside whatever WebView engine the OS provides rather than a browser you control the version of.

## Updating dependencies

```
npm outdated      # see what's behind
npm update        # update within semver ranges in package.json
```

Since this module has no runtime dependencies, this only affects `vite` and `vite-plugin-singlefile`. Test thoroughly with `npm run dev` before shipping after any bump.
