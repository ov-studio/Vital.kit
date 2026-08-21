# Overview

The Vital.kit debug console UI, built with Vite + React.

No CDN dependency - React, ReactDOM, and the JSX compiler are installed via npm and bundled at build time. The shipped output is a single static HTML file (`build/index.html`) with everything inlined, so it works offline, works via `file://`, and never breaks due to a CDN outage or version drift. This is the file Godot's WebView loads, per `manifest.json` (`"source": "build/index.html"`).

## Setup

```
npm install
```

## Development

```
npm run dev
```

Opens a local dev server (default `http://localhost:5173`) with hot reload.

In dev mode, `app/main.jsx` stubs the `ipc` object Godot normally injects and dispatches fake `init`/`print` events with sample log entries, so the console can be exercised without Godot running. This is gated behind `import.meta.env.DEV`, which Vite sets to `true` in dev and strips out entirely in production - none of this code ships.

Dev mode also serves `/kit`, a Vite middleware (`vite.config.js`) that concatenates the source files listed in `../../js/manifest.json` into one script, so the console can be tested against the same kit code it ships alongside.

## Production

```
npm run build
```

Outputs a single self-contained file: `../build/index.html`. No CDN, no separate JS/CSS files, and no dev-only code - `import.meta.env.DEV` is `false`, so the `/kit` fetch and `ipc` stub are stripped at build time.

To preview the production build locally before shipping:

```
npm run preview
```

## Updating React or other dependencies

```
npm outdated      # see what's behind
npm update        # update within semver ranges in package.json
```

To bump a major version (e.g. React 19), update the version in `package.json`, run `npm install`, then test with `npm run dev` before shipping.
