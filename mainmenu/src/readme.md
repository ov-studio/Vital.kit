# Overview

The Vital.kit main menu UI, built with Vite + React.

No CDN dependency - React, ReactDOM, and the JSX compiler are installed via npm and bundled at build time. The shipped output is a single static HTML file (`build/index.html`) with everything inlined, so it works offline, works via `file://`, and never breaks due to a CDN outage or version drift. This is the file Godot's WebView loads, per `manifest.json` (`"source": "build/index.html"`).

This module is currently a self-contained visual mockup: server listings, banners, logos, and the featured/hero server in `app/data.jsx` are hardcoded placeholder data rather than data received over `ipc`, and actions like Join, Exit, and the settings toggles are stubbed (`handleExit` in `app/mainmenu.jsx` is a no-op marked `TODO`). Unlike `console` and `splash`, it doesn't yet fetch the `js` kit bundle via a `/kit` dev endpoint - there's no `ipc` wiring to stub out for local development.

## Setup

```
npm install
```

## Development

```
npm run dev
```

Opens a local dev server (default `http://localhost:5173`) with hot reload. With no live `ipc` connection to Godot yet, the menu renders directly against the placeholder data in `app/data.jsx`.

## Production

```
npm run build
```

Outputs `../build/index.html`, ready to drop into Godot's WebView.

## Preview

```
npm run preview
```

Serves the production build locally so it can be checked before shipping.

## Wiring up real data

Replace the placeholder arrays in `app/data.jsx` (`SERVERS`, `BANNERS`, `LOGOS`, `FEATURED`, `HERO`) with data received over `ipc`, following the same `message`/`ipc.postMessage` pattern used in `console`'s and `splash`'s `app/main.jsx` - stub `ipc` and dispatch fake `message` events behind `import.meta.env.DEV` so the menu stays testable without Godot running.
