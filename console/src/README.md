# Overview

The Vital.kit debug console UI, built with Vite + React.

No CDN dependency anywhere - React, ReactDOM, and the JSX compiler are all installed via npm and bundled at build time.
The shipped output is a single static HTML file (`build/index.html`) with everything inlined - CSS and JS included - so it works offline, works via `file://`, and never breaks due to a CDN outage or version drift. This is the file Godot's WebView loads, per `manifest.json` (`"source": "build/index.html"`).

## Setup

```
npm install
```

## Development

```
npm run dev
```

Opens a local dev server (default `http://localhost:5173`) with hot reload.

While in dev mode, `app/main.jsx` stubs the `ipc` object that Godot normally injects and dispatches fake `init`/`print` events with sample log entries, so you can see and interact with the console without Godot running. This relies on `import.meta.env.DEV`, which Vite's dev server sets to `true` and its production build statically strips out - so none of this harness code ships.

Dev mode also serves `/kit`, a small Vite middleware defined in `vite.config.js` that concatenates the source files listed in `../../js/manifest.json` (relative to the `sandbox` module's Lua/JS kit) into one script and serves it live, so the console can be tested against the same kit code that ships alongside it.

## Production

```
npm run build
```

Outputs a single self-contained file: `../build/index.html`. It has no external dependencies (no CDN, no separate JS/CSS files to keep in sync) and no dev-only harness code - `import.meta.env.DEV` is `false`, so the `/kit` fetch and `ipc` stub are dead-code-eliminated at build time.

To preview the production build locally before shipping it:

```
npm run preview
```

## Updating theme.css

The app's styling (`app/index.css`) is built on top of theme variables (`--bg`, `--bg7`, `--blue`, `--text-faint`, etc.) that are expected to come from a `theme.css` shared with the Vital.site documentation site, rather than being defined locally. This file is not checked into this repo.

If the site's palette changes, copy the updated [`theme.css`](https://github.com/ov-studio/Vital.site/blob/main/app/theme.css) into `app/` here and run `npm run build` again - `index.css` references its variables directly, so no other changes are needed.

## Browser/WebView compatibility

The build targets `es2022` (see `build.target` in `vite.config.js`), which is supported by all native WebView backends in current use (WebView2/Chromium on Windows, WebKitGTK on Linux, WKWebView on macOS) as of any reasonably recent OS.

This was deliberately set conservative rather than relying on Vite's newer default targets, since the console renders inside whatever WebView engine the OS provides rather than a browser you control the version of.

## Updating React or other dependencies

```
npm outdated      # see what's behind
npm update        # update within semver ranges in package.json
```

To bump a major version (e.g. React 19), update the version in `package.json` first, then `npm install`, then test thoroughly with `npm run dev` before shipping.
