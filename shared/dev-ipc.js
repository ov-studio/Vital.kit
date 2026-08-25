// In production these pages run inside a Godot WebView. Godot injects a
// global `ipc` object (for outgoing messages) and dispatches a "message"
// CustomEvent on `document` (for incoming data). Neither exists in a plain
// browser, so during `npm run dev` this fetches the bundled game module
// through each app's `/kit` middleware (see shared/kit-plugin.js) and
// stubs `ipc` so postMessage calls have somewhere to go.
//
// Guards internally on import.meta.env.DEV, so callers don't need to wrap
// this in their own DEV check — Vite statically replaces DEV at every
// usage site (including inside this shared module) and dead-code-eliminates
// the unreachable body in production builds. No manual cleanup needed.

export async function install_dev_ipc_stub() {
  if (import.meta.env.DEV) {
    new Function(await (await fetch('/kit')).text())();

    if (!window.ipc) {
      window.ipc = {
        postMessage(json) {
          console.log('[ipc -> godot]', JSON.parse(json));
        }
      };
    }
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
