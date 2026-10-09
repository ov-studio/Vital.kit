/* Mainmenu ↔ C++ IPC bridge (same pattern as splash).
 * UI dispatches window events; this module posts IPC actions.
 * C++ owns client_settings.json and pushes { action: "settings", username } on ready. */

let cached_settings = null;
let cached_username = null;
let cached_updates = [];
let cached_localservers = [];
let cached_bind = null;
let cached_versions = []; // [{ label, value }] from the host, display order
let cached_masterlist = { status: 'loading', servers: [] }; // status: loading | ok | error
let cached_masterlist_refresh = 15 * 1000; // ms
let cached_connection = { state: 'idle', ip: '', port: 0 };

function post(payload) {
  window.ipc?.postMessage(JSON.stringify(payload));
}

document.addEventListener('message', (e) => {
  try {
    const data = JSON.parse(e.detail);
    if (data?.action === 'update') {
      // Host lists only outdated components: [{ name, current, latest, url }]
      cached_updates = Array.isArray(data.updates) ? data.updates : [];
      window.dispatchEvent(new CustomEvent('mainmenu:update', { detail: cached_updates }));
    }
    if (data?.action === 'init') {
      if (typeof data.bind === 'string') cached_bind = data.bind;
      if (Number.isInteger(data.masterlist_refresh)) cached_masterlist_refresh = data.masterlist_refresh;
      if (Array.isArray(data.versions)) cached_versions = data.versions.filter(v => v && typeof v.label === 'string' && typeof v.value === 'string');
      window.dispatchEvent(new Event('mainmenu:init'));
    }
    if (data?.action === 'masterlist') {
      // On failure keep the last good list so a blip doesn't blank the menu; status drives the empty/error state.
      cached_masterlist = data.ok && Array.isArray(data.servers)
        ? { status: 'ok', servers: data.servers }
        : { status: cached_masterlist.servers.length ? 'ok' : 'error', servers: cached_masterlist.servers };
      window.dispatchEvent(new CustomEvent('mainmenu:masterlist', { detail: cached_masterlist }));
    }
    if (data?.action === 'fadeout') window.dispatchEvent(new Event('mainmenu:fadeout'));
    if (data?.action === 'localservers') {
      // Host-verified servers on this machine: [{ name, port, http_port, max_peers, ... }]
      cached_localservers = Array.isArray(data.servers) ? data.servers : [];
      window.dispatchEvent(new CustomEvent('mainmenu:localservers', { detail: cached_localservers }));
    }
    if (data?.action === 'connection') {
      cached_connection = { state: data.state ?? 'idle', ip: data.ip ?? '', port: data.port ?? 0 };
      window.dispatchEvent(new CustomEvent('mainmenu:connection', { detail: cached_connection }));
    }
    if (data?.action === 'settings') {
      if (data.settings) {
        cached_settings = data.settings;
        window.dispatchEvent(new CustomEvent('mainmenu:settings_loaded', { detail: data.settings }));
      }
      if (typeof data.username === 'string' && data.username) {
        cached_username = data.username;
        window.dispatchEvent(new CustomEvent('mainmenu:username', { detail: data.username }));
      }
    }
  } catch { /* ignore */ }
});

window.addEventListener('mainmenu:drag', () => {
  post({ action: 'drag' });
});

window.addEventListener('mainmenu:exit', () => {
  post({ action: 'exit' });
});

window.addEventListener('mainmenu:open_url', (e) => {
  const url = String(e.detail ?? '');
  if (!/^https?:\/\//i.test(url)) return; // only web links ever leave the app
  post({ action: 'open_url', url });
});

window.addEventListener('mainmenu:connect', (e) => {
  const { ip, port, http_port } = e.detail ?? {};
  if (typeof ip !== 'string' || !Number.isInteger(port)) return;
  post({ action: 'connect', ip, port, http_port: Number.isInteger(http_port) ? http_port : -1 });
});

window.addEventListener('mainmenu:scan_local_servers', () => {
  post({ action: 'localservers' });
});

window.addEventListener('mainmenu:escape', () => {
  post({ action: 'escape' });
});

// Fade finished: ask the host to actually hide the webview.
window.addEventListener('mainmenu:hide', () => {
  post({ action: 'hide' });
});

window.addEventListener('mainmenu:fetch_masterlist', () => {
  post({ action: 'masterlist' });
});

window.addEventListener('mainmenu:disconnect', () => {
  post({ action: 'disconnect' });
});

window.addEventListener('mainmenu:settings', (e) => {
  post({ action: 'settings_update', settings: e.detail ?? {} });
});

/** Call once on boot so C++ marks the UI ready. */
export function ready() {
  post({ action: 'ready' });
}

export function drag() {
  window.dispatchEvent(new Event('mainmenu:drag'));
}

export function exit() {
  window.dispatchEvent(new Event('mainmenu:exit'));
}

/** Ask the host to open a URL in the user's default external browser. */
export function open_url(url) {
  window.dispatchEvent(new CustomEvent('mainmenu:open_url', { detail: url }));
}

export function connect(ip, port, http_port) {
  window.dispatchEvent(new CustomEvent('mainmenu:connect', { detail: { ip, port, http_port } }));
}

/** Ask the host to list the servers running on this machine (answer arrives as `mainmenu:localservers`). */
export function scan_local_servers() {
  window.dispatchEvent(new Event('mainmenu:scan_local_servers'));
}

/** Menu toggle key name from Vital.kit config/mainmenu.json (via host), null until ready. */
export function get_bind() {
  return cached_bind;
}

/** Esc pressed in the menu: host decides (it only fades out while connected to a game). */
export function escape() {
  window.dispatchEvent(new Event('mainmenu:escape'));
}

/** Fade-out done: host hides the webview. */
export function hide() {
  window.dispatchEvent(new Event('mainmenu:hide'));
}

/** Ask the host to fetch the live masterlist (answer arrives as `mainmenu:masterlist`). */
export function fetch_masterlist() {
  window.dispatchEvent(new Event('mainmenu:fetch_masterlist'));
}

/** { status: 'loading' | 'ok' | 'error', servers } raw masterlist rows from the host. */
export function get_masterlist() {
  return cached_masterlist;
}

/** [{ label, value }] component versions (Vital.sandbox, Vital.kit, Vital.wry, Vital.godot), fed by the host. */
export function get_versions() {
  return cached_versions;
}

/** Milliseconds between masterlist refreshes (Vital.kit config/masterlist.json `refresh`). */
export function get_masterlist_refresh() {
  return cached_masterlist_refresh;
}

export function disconnect() {
  window.dispatchEvent(new Event('mainmenu:disconnect'));
}

export function get_localservers() {
  return cached_localservers;
}

/** { state: 'idle' | 'connecting' | 'connected', ip, port } */
export function get_connection() {
  return cached_connection;
}

export function settings_update(settings) {
  window.dispatchEvent(new CustomEvent('mainmenu:settings', { detail: settings }));
}

export function get_settings() {
  return cached_settings;
}

/** OS username from C++ (Tool::get_username), null until ready. */
export function get_username() {
  return cached_username;
}

/** Outdated Vital.sandbox / Vital.kit components from the host; empty when up to date or unknown. */
export function get_updates() {
  return cached_updates;
}
