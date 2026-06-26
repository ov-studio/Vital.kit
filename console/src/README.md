# vital-console

The Vital.kit debug console UI (Godot WebView), built with Vite + React.

No CDN dependency anywhere - React, ReactDOM, and the JSX compiler are all
installed via npm and bundled at build time. The shipped output is a single
static HTML file with everything inlined, so it works offline, works via
`file://`, and never breaks due to a CDN outage or version drift.

## Setup

```
npm install
```

## Development

```
npm run dev
```

Opens a local dev server (default `http://localhost:5173`) with hot reload.
While in dev mode, a test harness automatically stubs the `ipc` object Godot
normally injects and feeds fake log data, so you can see and interact with
the console without needing Godot running. This harness is automatically
stripped out of production builds - see `src/main.jsx`.

## Production build

```
npm run build
```

Outputs a single self-contained file: `../build/index.html`. This is the file
you give to Godot - drop it in wherever `console/index.html` currently
lives. It has no external dependencies (no CDN, no separate JS/CSS files to
keep in sync) and no test harness code.

To preview the production build locally before shipping it:

```
npm run preview
```

## Updating theme.css

`src/theme.css` should stay in sync with the same file from the
Vital.sandbox documentation site. If the site's palette changes, copy the
updated `theme.css` here and run `npm run build` again - `index.css`
references its variables directly (`var(--blue)`, `var(--bg2)`, etc.), so
no other changes are needed.

## Browser/WebView compatibility

The build targets `es2020` (`vite.config.js`), which is supported by all
native WebView backends in current use (WebView2/Chromium on Windows,
WebKitGTK on Linux, WKWebView on macOS) as of any reasonably recent OS.
This was deliberately set conservative rather than relying on Vite's
default `modules` target, since the console renders inside whatever
WebView engine the OS provides rather than a browser you control the
version of.

## Known timing edge case (pre-existing, not introduced by this port)

If Godot dispatches an `init` message and the first `print` message in the
exact same synchronous turn (no tick/frame between them), the first log can
be silently dropped. This is because `handle_message` is a `useCallback`
that closes over `seed_meta`, and the effect that re-subscribes it with the
updated `seed_meta` hasn't run yet when the synchronous `print` arrives.
In practice this hasn't surfaced, since `init` typically fires once on
mount, before any real log calls happen. Flagging it here in case your
Godot-side code ever batches these calls together.

## Updating React or other dependencies

```
npm outdated      # see what's behind
npm update        # update within semver ranges in package.json
```

To bump a major version (e.g. React 19), update the version in
`package.json` first, then `npm install`, then test thoroughly with
`npm run dev` before shipping.
