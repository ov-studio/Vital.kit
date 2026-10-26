# Overview

The Vital.kit main menu UI, built with Vite + React. React is bundled at build time.

The shipped output is a single static HTML file (`build/index.html`). Godot's WebView loads it via `manifest.json` (`"source": "build/index.html"`).

The look is shared with the site rather than copied from it:

- `ui/` components (Brand, Button, Card, Checkbox, Divider, EmptyState, Filter, IconButton, Panel, Search, Section, Select, Stat, TagPill) are synced from `vital-sandbox.com/cdn/ui` into `shared/ui/` (gitignored) by `scripts/sync-ui.mjs` before `dev`/`build`, then bundled and imported through the `@ui` alias. `vite.config.js` also pins `react`, `react-dom` and `lucide-react` to this project's `node_modules`, since `shared/ui` sits outside it.
- `theme.css` and `global.css` are linked from `vital-sandbox.com/cdn`. `Brand` is used logo-only; its mask is overridden in `app/index.css` with an embedded copy (the CDN logo isn't CORS-enabled and the build is asset-free).

`app/index.css` only holds mainmenu-specific layout and overrides.

## Configuration

- `shared/config.js` (repo root) is the single source for the domain and every URL (site, api, cdn, docs, discord, donate, news). Change `DOMAIN` there and the app, `scripts/sync-ui.mjs` and the `{{site}}` / `{{cdn}}` tokens in each `index.html` all follow.
- `app/config.js` holds every mainmenu tunable: top-bar links, timings, list sizes, card geometry and settings defaults/options.
- Menu bind and masterlist refresh come from `config/mainmenu.json` / `config/masterlist.json` through the host.

Server listings, news and local servers are live data: the host (or the news API) supplies them and `app/data/` normalises the rows. Settings are sent to Godot as `settings_update` over `ipc.postMessage`.

## Structure

Mirrors the site's `ui/` convention: one folder per component under `app/components/`, each with its own `index.jsx` and `index.css`.

```
app/
  main.jsx            entry (dev ipc stub, key binds, fade, mounts MainMenu)
  config.js           all tunables (see Configuration)
  events.js           host IPC bridge: incoming cache + outgoing actions
  hooks.js            useEventState, usePolling, usePopover
  data/               row normalising + masterlist / news hooks
  index.css           base only: tokens, fonts, page reset
  components/
    mainmenu/         shell: sidebar + hud + switching views
    hud/              top bar (about, notifications, links, exit)
    sidebar/          side rail navigation
    featured/         hero banner + featured list
    cardgrid/         CardGrid + useFitCount (fit-to-space maths)
    gamecard/         single server card
    localserver/      servers running on this machine
    news/             news feed
    about/            component versions panel
    notifications/    update panel
    pic/              remote image with colour fallback
    settingrow/       label/description + control row
    icons/            DiscordIcon
    views/{play,masterlist,favs,settings}/
```

A component imports its `shared/ui` dependencies first and its own `./index.css` last, so local overrides always win the cascade.

## Local server

The Browse view shows a "Local server" bar when a Vital.server is running on this machine, with a Connect button. Presence is detected by polling `http://127.0.0.1:7778/info` (the server's asset HTTP port; it answers with name, ports, players and max peers, and allows cross-origin reads). Connect posts `{ action: "connect", ip, port, http_port }` over IPC, which the host handles like the console `connect` command. The bar is hidden when nothing answers.

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
