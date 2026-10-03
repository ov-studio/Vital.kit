# Overview

The Vital.kit main menu UI, built with Vite + React. React is bundled at build time; no CDN dependency.

The shipped output is a single static HTML file (`build/index.html`) with everything inlined. Godot's WebView loads it via `manifest.json` (`"source": "build/index.html"`).

Currently a visual mockup: server listings, banners and the featured server in `app/data.jsx` are hardcoded placeholders, and actions (Join, Exit, settings toggles) are stubbed (`handleExit` in `app/mainmenu.jsx` is a `TODO` no-op). There is no `ipc` wiring yet.

## Setup

```
npm install
```

## Development

```
npm run dev
```

Starts a dev server (default `http://localhost:5173`) with hot reload, rendering the placeholder data.

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
