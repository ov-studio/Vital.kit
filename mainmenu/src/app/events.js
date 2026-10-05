function post(action) {
  window.ipc?.postMessage(JSON.stringify({ action }));
}

window.addEventListener('mainmenu:drag', () => {
  post('drag');
});

window.addEventListener('mainmenu:exit', () => {
  post('exit');
});

/** Call once on boot so C++ marks the UI ready. */
export function ready() {
  post('ready');
}

/** Helpers for React / other modules. */
export function drag() {
  window.dispatchEvent(new Event('mainmenu:drag'));
}

export function exit() {
  window.dispatchEvent(new Event('mainmenu:exit'));
}
