// In production these pages run inside a Godot WebView. Godot injects a
// global `ipc` object (for outgoing messages) and dispatches a "message"
// CustomEvent on `document` (for incoming data). Neither exists in a plain
// browser, so during `npm run dev` this fetches the bundled game module
// through each app's `/kit` middleware (see vite.config.js) and stubs
// `ipc` so postMessage calls have somewhere to go.
//
// import.meta.env.DEV is true only for `npm run dev` — Vite's production
// build statically strips any `if (import.meta.env.DEV)` block around a
// call to this, so it never ships to Godot. No manual cleanup needed.

export async function install_dev_ipc_stub() {
  if (!import.meta.env.DEV) return;

  new Function(await (await fetch('/kit')).text())();

  if (!window.ipc) {
    window.ipc = {
      postMessage(json) {
        console.log('[ipc -> godot]', JSON.parse(json));
      }
    };
  }
}

// Dispatches a fake "message" CustomEvent, mirroring what Godot sends for
// incoming data. Call after install_dev_ipc_stub() to simulate init/print/
// clear payloads Godot would normally push in.
export function dispatch_dev_message(payload) {
  document.dispatchEvent(new CustomEvent('message', {
    detail: JSON.stringify(payload)
  }));
}
