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
          const msg = JSON.parse(json);
          console.log('[ipc -> godot]', msg);
          // Mirror the host: open_url launches the external browser.
          if (msg.action === 'open_url') window.open(msg.url, '_blank', 'noopener');
          // Dev only: the host fetches the masterlist; here a tiny sample stands in (?masterlist=empty|error to see those states).
          if (msg.action === 'masterlist') {
            const mode = new URLSearchParams(location.search).get('masterlist');
            const rows = [
              { id: 'a1', name: 'Dev Server One', ip: '127.0.0.1', port: 7777, httpPort: 7778, players: 12, maxPlayers: 32, description: 'Sample row for local UI work.', tags: ['roleplay', 'racing'], discord: 'https://discord.gg/', website: 'https://vital.site',
                logo: 'https://placehold.co/128x128/2b3a67/ffffff?text=D1', banner: 'https://placehold.co/1200x600/2b3a67/ffffff?text=Dev+Server+One' },
              { id: 'b2', name: 'Dev Server Two', ip: '127.0.0.1', port: 7888, httpPort: 7889, players: 64, maxPlayers: 64, tags: ['sandbox', 'roleplay'], description: null, discord: null, website: null }, // no logo / banner: plain colour fallback
              { id: 'c3', name: 'Dev Server Three', ip: '127.0.0.1', port: 7999, httpPort: 7998, players: 3, maxPlayers: 16, tags: ['survival'], description: 'Banner only, logo falls back.', discord: null, website: null,
                banner: 'https://placehold.co/1200x600/5a2b2b/ffffff?text=Dev+Server+Three' },
              { id: 'd4', name: 'Dev Server Four', ip: '127.0.0.1', port: 7555, httpPort: 7556, players: 1, maxPlayers: 8, tags: ['pvp'], description: 'Images fail to load: falls back to plain colour.', discord: null, website: null,
                logo: 'https://invalid.invalid/logo.png', banner: 'https://invalid.invalid/banner.png' },
            ];
            setTimeout(() => dispatch_dev_message({ action: 'masterlist', ok: mode !== 'error', servers: mode === 'empty' || mode === 'error' ? [] : rows }), 200);
          }
          // Dev only: open the page with ?update to simulate an outdated build.
          if (msg.action === 'ready' && new URLSearchParams(location.search).has('update')) {
            dispatch_dev_message({ action: 'update', updates: [
              { name: 'Vital.sandbox', current: 'v1.0.0', latest: 'v1.1.0', url: 'https://github.com/ov-studio/Vital.sandbox/releases' }
            ] });
          }
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
