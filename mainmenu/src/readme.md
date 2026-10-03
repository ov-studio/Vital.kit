# Overview

The Vital.kit main menu UI, built with Vite + React. React is bundled at build time.

The shipped output is a single static HTML file (`build/index.html`). Godot's WebView loads it via `manifest.json` (`"source": "build/index.html"`).

The look is shared with the site rather than copied from it:

- `ui/` components (Card, Button, TagPill, Filter, Search, IconButton, Divider, EmptyState) are synced from `vital-sandbox.com/cdn/ui` into `shared/ui/` (gitignored) by `scripts/sync-ui.mjs` before `dev`/`build`, then bundled.
- `theme.css`, `global.css` and `ui/brand/index.css` are linked from `vital-sandbox.com/cdn` (the logo mask stays embedded in `app/index.css`; the CDN logo isn't CORS-enabled).

`app/index.css` only holds mainmenu-specific layout and overrides.

Server listings, banners and the featured servers in `app/data.jsx` are hardcoded placeholders. Settings are sent to Godot as `settings_update` over `ipc.postMessage`; Join, Exit and Downloads are stubbed (`handleExit` in `app/mainmenu.jsx` is a `TODO` no-op).

## Setup

```
npm install
```

## Development

```
npm run dev
```

Starts a dev server (default `http://localhost:5173`) with hot reload. `app/main.jsx` stubs Godot's `ipc` and serves `/kit` (bundled `../../module/js/manifest.json` sources) via `shared/`; both are dev-only and stripped from production builds.

## Production

```
npm run build
```

Outputs `../build/index.html`.

## Preview

```
npm run preview
```

Serves the production build locally. Without Godot, `ipc.postMessage` calls log to the console only if the dev stub is active; check the console.
