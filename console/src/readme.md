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

`app/main.jsx` stubs the `ipc` object Godot normally injects and dispatches fake `init`/`print` events with sample log entries, so the console works without Godot running. This is gated behind `import.meta.env.DEV` and stripped entirely in production.

The dev server also serves `/kit` (`vite.config.js`), bundling the source files listed in `../../js/manifest.json` so the console can be tested against the same kit code it ships alongside.

## Production

```
npm run build
```

Outputs `../build/index.html`, ready to drop into Godot's WebView. Dev-only code (`ipc` stub, `/kit` fetch) is stripped automatically.

## Preview

```
npm run preview
```

Serves the production build locally so it can be checked before shipping.
