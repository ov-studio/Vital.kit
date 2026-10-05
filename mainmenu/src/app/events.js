/* Mainmenu ↔ C++ IPC bridge (same pattern as splash).
 * UI code dispatches window events; this module posts the matching action. */

function post(payload) {
  window.ipc?.postMessage(JSON.stringify(payload));
}

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

/** Helpers for React / other modules. */
export function drag() {
  window.dispatchEvent(new Event('mainmenu:drag'));
}

export function exit() {
  window.dispatchEvent(new Event('mainmenu:exit'));
}

export function settings_update(settings) {
  window.dispatchEvent(new CustomEvent('mainmenu:settings', { detail: settings }));
}
