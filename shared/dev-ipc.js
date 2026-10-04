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
    // Only ever trust the /kit bundle when the dev server is being
    // accessed locally. If it's exposed on the network (e.g. `vite
    // --host`), refuse to eval whatever came back, since that response
    // could now be tampered with via MITM/DNS spoofing.
    if (!['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
      console.error('[dev-ipc] refusing to load /kit bundle: not on localhost');
      return;
    }

    const res = await fetch('/kit');
    if (!res.ok || !(res.headers.get('content-type') || '').includes('javascript')) {
      console.error('[dev-ipc] refusing to load /kit bundle: unexpected response');
      return;
    }

    new Function(await res.text())();

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
