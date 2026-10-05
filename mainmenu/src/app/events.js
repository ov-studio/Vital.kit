/* Mainmenu ↔ C++ IPC bridge (same pattern as splash).
 * UI dispatches window events; this module posts IPC actions.
 * C++ owns client_settings.json and pushes { action: "settings", username } on ready. */

let cached_settings = null;
let cached_username = null;

function post(payload) {
  window.ipc?.postMessage(JSON.stringify(payload));
}

document.addEventListener('message', (e) => {
  try {
    const data = JSON.parse(e.detail);
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
