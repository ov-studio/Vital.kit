# Overview

The Vital.kit debug console UI, built with Vite + React. React is bundled at build time; no CDN dependency.

The shipped output is a single static HTML file (`build/index.html`) with everything inlined. Godot's WebView loads it via `manifest.json` (`"source": "build/index.html"`).

## Setup

```
npm install
```

## Development

```
npm run dev
```

Starts a dev server (default `http://localhost:5173`) with hot reload. `app/main.jsx` stubs Godot's `ipc` and fires fake `init`/`print` events with sample logs, so the console runs standalone. Dev-only code is stripped from production builds.

## Production

```
npm run build
```

Outputs `../build/index.html`.

## Preview

```
npm run preview
```

Serves the production build locally.
