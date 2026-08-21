# Overview

The Vital.kit main menu UI, built with Vite + React.

No CDN dependency anywhere - React, ReactDOM, and the JSX compiler are all installed via npm and bundled at build time.
The shipped output is a single static HTML file (`build/index.html`) with everything inlined - CSS and JS included - so it works offline, works via `file://`, and never breaks due to a CDN outage or version drift. This is the file Godot's WebView loads, per `manifest.json` (`"source": "build/index.html"`).

At present this module is a self-contained visual mockup: server listings, banners, logos, and the featured/hero server in `app/data.jsx` are hardcoded placeholder data rather than data received over `ipc`, and actions like Join, Exit, and the settings toggles are stubbed (`handleExit` in `app/mainmenu.jsx` is a no-op marked `TODO`). Unlike `console` and `splash`, this module doesn't yet fetch the `js` kit bundle via a `/kit` dev endpoint - there's no `ipc`/event wiring to stub out for local development.

## Setup

```
npm install
```

## Development

```
npm run dev
```

Opens a local dev server (default `http://localhost:5173`) with hot reload. Since there's no live `ipc` connection to Godot yet, the menu just renders directly against the placeholder data in `app/data.jsx`.

## Production

```
npm run build
```

Outputs a single self-contained file: `../build/index.html`. It has no external dependencies (no CDN, no separate JS/CSS files to keep in sync).

To preview the production build locally before shipping it:

```
npm run preview
```

## Updating theme.css

The app's styling (`app/index.css`) extends a shared set of theme variables (`--bg`, `--bg7`, `--blue`, `--text-mid`, etc. - see the comment at the top of the file) that are expected to come from a `theme.css` shared with the Vital.site documentation site, rather than being defined locally. This file is not checked into this repo. Local-only tokens (status colors, white-overlay scale) are defined directly in `index.css`'s own `:root` block and don't need to move.

If the site's palette changes, copy the updated [`theme.css`](https://github.com/ov-studio/Vital.site/blob/main/app/theme.css) into `app/` here and run `npm run build` again - `index.css` references its variables directly, so no other changes are needed.

## Browser/WebView compatibility

The build targets `es2022` (see `build.target` in `vite.config.js`), which is supported by all native WebView backends in current use (WebView2/Chromium on Windows, WebKitGTK on Linux, WKWebView on macOS) as of any reasonably recent OS.

This was deliberately set conservative rather than relying on Vite's newer default targets, since the menu renders inside whatever WebView engine the OS provides rather than a browser you control the version of.

## Updating React or other dependencies

```
npm outdated      # see what's behind
npm update        # update within semver ranges in package.json
```

To bump a major version (e.g. React 19), update the version in `package.json` first, then `npm install`, then test thoroughly with `npm run dev` before shipping.

## Wiring up real data

Replace the placeholder arrays in `app/data.jsx` (`SERVERS`, `BANNERS`, `LOGOS`, `FEATURED`, `HERO`) with data received over `ipc`, following the same `message`/`ipc.postMessage` pattern used in `console`'s and `splash`'s `app/main.jsx` (stub `ipc` and dispatch fake `message` events behind `import.meta.env.DEV` so the menu stays testable without Godot running).
