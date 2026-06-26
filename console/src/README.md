# Overview

The Vital.kit debug console UI, built with Vite + React.

No CDN dependency anywhere - React, ReactDOM, and the JSX compiler are all installed via npm and bundled at build time. 
The shipped output is a single static HTML file with everything inlined, so it works offline, works via `file://`, and never breaks due to a CDN outage or version drift.

## Setup

```
npm install
```

## Development

```
npm run dev
```

Opens a local dev server (default `http://localhost:5173`) with hot reload.

While in dev mode, a test harness automatically stubs the `ipc` object that sandbox normally injects and feeds fake log data, so you can see and interact with the console without needing sandbox running. 

This harness is automatically stripped out of production builds - see `app/main.jsx`.

## Production

```
npm run build
```

Outputs a single self-contained file: `../build/index.html`.

This is the file that sandbox serves. It has no external dependencies (no CDN, no separate JS/CSS files to keep in sync) and no test harness code.

To preview the production build locally before shipping it:

```
npm run preview
```

## Updating theme.css

`app/theme.css` should stay in sync with the same file from the Vital.sandbox documentation site. 
If the site's palette changes, copy the updated `theme.css` here and run `npm run build` again - `index.css` references its variables directly (`var(--blue)`, `var(--bg2)`, etc.), so no other changes are needed.

## Browser/WebView compatibility

The build targets `es2020` (`vite.config.js`), which is supported by all native WebView backends in current use (WebView2/Chromium on Windows, WebKitGTK on Linux, WKWebView on macOS) as of any reasonably recent OS.
This was deliberately set conservative rather than relying on Vite's default `modules` target, since the console renders inside whatever WebView engine the OS provides rather than a browser you control the version of.

## Updating React or other dependencies

```
npm outdated      # see what's behind
npm update        # update within semver ranges in package.json
```

To bump a major version (e.g. React 19), update the version in
`package.json` first, then `npm install`, then test thoroughly with
`npm run dev` before shipping.
