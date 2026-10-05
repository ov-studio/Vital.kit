/* Mainmenu ↔ C++ IPC bridge (same pattern as splash).
 * UI dispatches window events; this module posts IPC actions.
 * C++ owns client_settings.json and pushes { action: "settings", username } on ready. */

let cached_settings = null;
let cached_username = null;
let cached_updates = [];

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
