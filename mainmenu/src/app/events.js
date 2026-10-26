/* Mainmenu ↔ host (C++) IPC bridge.
 *   Outgoing: exported functions post `{ action, ... }` through window.ipc.
 *   Incoming: the host dispatches a "message" event; each action is cached here and
 *             re-broadcast as a `mainmenu:*` window event the UI hooks listen to.
 * C++ owns client_settings.json and pushes { action: "settings", ... } on ready. */

import { NEWS_URL, MASTERLIST_REFRESH } from './config.js';

/* ---- Cache (last known host state) --------------------------------------- */

let settings        = null;
let username        = null;
let bind            = null;                                   // menu toggle key (config/mainmenu.json)
let versions        = [];                                     // [{ label, value }], display order
let updates         = [];                                     // outdated components only
let localservers    = [];
let masterlist_ms   = MASTERLIST_REFRESH;                     // config/masterlist.json `refresh`
let masterlist      = { status: 'loading', servers: [] };     // status: loading | ok | error
let news            = { status: 'loading', posts: [] };       // status: loading | ok | error
let connection      = { state: 'idle', ip: '', port: 0 };     // state: idle | connecting | connected

const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const post = (payload) => window.ipc?.postMessage(JSON.stringify(payload));

/* On failure keep the last good rows so a blip never blanks the list; status drives the empty/error state. */
const merge = (prev, key, rows) => rows
  ? { status: 'ok', [key]: rows }
  : { status: prev[key].length ? 'ok' : 'error', [key]: prev[key] };

function set_news(posts) {
  news = merge(news, 'posts', posts);
  emit('mainmenu:news', news);
}

/* ---- Incoming ------------------------------------------------------------ */

const incoming = {
  init(d) {
    if (typeof d.bind === 'string') bind = d.bind;
    if (Number.isInteger(d.masterlist_refresh)) masterlist_ms = d.masterlist_refresh;
    if (Array.isArray(d.versions)) versions = d.versions.filter(v => v && typeof v.label === 'string' && typeof v.value === 'string');
    emit('mainmenu:init');
  },

  /* [{ name, current, latest, url, state, received, total, message }]; state: idle | downloading | ready | installing | error */
  update(d) {
    updates = Array.isArray(d.updates) ? d.updates : [];
    emit('mainmenu:update', updates);
  },

  masterlist(d) {
    masterlist = merge(masterlist, 'servers', d.ok && Array.isArray(d.servers) ? d.servers : null);
    emit('mainmenu:masterlist', masterlist);
  },

  /* Optional host-side fetch; same rows as GET /news -> posts. */
  news(d) {
    set_news(d.ok && Array.isArray(d.posts) ? d.posts : null);
  },

  /* Host-verified servers on this machine: [{ name, port, http_port, max_peers, ... }] */
  localservers(d) {
    localservers = Array.isArray(d.servers) ? d.servers : [];
    emit('mainmenu:localservers', localservers);
  },

  connection(d) {
    connection = { state: d.state ?? 'idle', ip: d.ip ?? '', port: d.port ?? 0 };
    emit('mainmenu:connection', connection);
  },

  settings(d) {
    if (d.settings) {
      settings = d.settings;
      emit('mainmenu:settings_loaded', settings);
    }
    if (typeof d.username === 'string' && d.username) {
      username = d.username;
      emit('mainmenu:username', username);
    }
  },

  fadeout() {
    emit('mainmenu:fadeout');
  },
};

document.addEventListener('message', (e) => {
  try {
    const data = JSON.parse(e.detail);
    incoming[data?.action]?.(data);
  } catch { /* ignore malformed host messages */ }
});

/* ---- Outgoing ------------------------------------------------------------ */

/** Call once on boot so C++ marks the UI ready. */
export const ready  = () => post({ action: 'ready' });
export const drag   = () => post({ action: 'drag' });
export const exit   = () => post({ action: 'exit' });

/** Esc / menu bind pressed: the host decides (it only fades out while connected to a game). */
export const escape = () => post({ action: 'escape' });

/** Fade-out finished: the host hides the webview. */
export const hide   = () => post({ action: 'hide' });

/** Ask the host for the live masterlist (answer arrives as `mainmenu:masterlist`). */
export const fetch_masterlist = () => post({ action: 'masterlist' });

/** Ask the host to list servers running on this machine (answer arrives as `mainmenu:localservers`). */
export const scan_local_servers = () => post({ action: 'localservers' });

export const disconnect = () => post({ action: 'disconnect' });

export const settings_update = (values) => post({ action: 'settings_update', settings: values ?? {} });

/** Open a URL in the user's default browser. Only web links ever leave the app. */
export function open_url(url) {
  if (/^https?:\/\//i.test(String(url ?? ''))) post({ action: 'open_url', url });
}

export function connect(ip, port, http_port) {
  if (typeof ip !== 'string' || !Number.isInteger(port)) return;
  post({ action: 'connect', ip, port, http_port: Number.isInteger(http_port) ? http_port : -1 });
}

/* Update flow: the host downloads into its updates folder, then restarts to install. */
export function update_download(name) {
  if (name) post({ action: 'update_download', name: String(name) });
}
export const update_apply = () => post({ action: 'update_apply' });

/** Ask for the latest news posts (answer arrives as `mainmenu:news`). */
export async function fetch_news() {
  post({ action: 'news' }); // host may answer (see above); otherwise fall back to a direct request
  try {
    const res = await fetch(NEWS_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    set_news(Array.isArray(json?.posts) ? json.posts : null);
  } catch {
    if (news.status !== 'ok') set_news(null);
  }
}

/* ---- Getters (cached host state) ----------------------------------------- */

export const get_settings           = () => settings;
export const get_username           = () => username;                 // OS username, null until ready
export const get_bind               = () => bind;                     // menu toggle key, null until ready
export const get_versions           = () => versions;                 // Sandbox, Kit, Wry, Godot
export const get_updates            = () => updates;                  // empty when up to date or unknown
export const get_localservers       = () => localservers;
export const get_masterlist         = () => masterlist;               // { status, servers } raw rows
export const get_masterlist_refresh = () => masterlist_ms;            // ms between masterlist refreshes
export const get_news               = () => news;                     // { status, posts } raw rows
export const get_connection         = () => connection;               // { state, ip, port }
