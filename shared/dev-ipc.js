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

    // Dev only: fire a connection notice from the console at any time, from any view.
    //   __dev_notice('failed' | 'lost' | 'kicked' | 'mismatch', 'optional reason')
    //   __dev_notice(null) clears it.
    const MISMATCH_REASON = 'Version mismatch: the server runs v0.9.12-internal and this client is v0.0.0-dev. Update so both are on the same major version.';
    window.__dev_notice = (kind = 'failed', reason) => {
      const target = { ip: '127.0.0.1', port: 7777 };
      if (kind === null) return dispatch_dev_message({ action: 'connection', state: 'idle' });
      const event = kind === 'mismatch' ? 'failed' : kind;
      const text = reason ?? (kind === 'mismatch' ? MISMATCH_REASON : kind === 'kicked' ? 'Kicked by an admin: AFK too long' : kind === 'failed' ? 'Connection timed out' : '');
      dispatch_dev_message({ action: 'connection', state: 'idle', event, reason: text, ...target });
    };

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
              { 
                id: 'a1', 
                name: 'Dev Server One', 
                ip: '127.0.0.1', 
                port: 7777, 
                http_port: 7778, 
                players: 12, 
                max_players: 32, 
                description: 'Sample row for local UI work.', 
                tags: ['roleplay', 'racing'], 
                discord: 'https://discord.gg/', 
                website: 'https://vital.site',
                logo: 'https://placehold.co/128x128/2b3a67/ffffff?text=D1', 
                banner: 'https://wallpapercave.com/wp/wp7402137.jpg' 
              },
              { 
                id: 'b2', 
                name: 'Dev Server Two', 
                ip: '127.0.0.1', 
                port: 7888, 
                http_port: 7889, 
                players: 64, 
                max_players: 64, 
                tags: ['sandbox', 'roleplay'], 
                description: null, 
                discord: null, 
                website: null, 
                banner: 'https://kawaiihoshi.com/wp-content/uploads/2023/03/peach-goma-seaside-cafe-desktop-wallpaper-kawaii-hoshi-1536x1047.jpg'
              },
              { 
                id: 'c3', 
                name: 'Dev Server Three', 
                ip: '127.0.0.1', 
                port: 7999, 
                http_port: 7998, 
                players: 3, 
                max_players: 16, 
                tags: ['survival'], 
                description: 'Banner only, logo falls back.', 
                discord: null, 
                website: null,
                banner: 'https://img.magnific.com/premium-photo/cute-chibi-animal-with-autumn-pumpkins-glitter-background_1228018-9770.jpg?semt=ais_hybrid&w=740&q=80' 
              },
              { 
                id: 'd4', 
                name: 'Dev Server Four', 
                ip: '127.0.0.1', 
                port: 7555, 
                http_port: 7556, 
                players: 1, 
                max_players: 8, 
                tags: ['pvp'], 
                description: 'Images fail to load: falls back to plain colour.', 
                discord: null, 
                website: null,
                logo: 'https://invalid.invalid/logo.png', 
                banner: 'https://img.magnific.com/free-photo/cute-cartoon-mushroom-illustration_23-2151700603.jpg?semt=ais_hybrid&w=740&q=80' 
              }
            ];
            setTimeout(() => dispatch_dev_message({ action: 'masterlist', ok: mode !== 'error', servers: mode === 'empty' || mode === 'error' ? [] : rows }), 200);
          }

          // Dev only: simulate the connection lifecycle. Add ?drop=kicked|lost|failed|mismatch to see the error notices
          // (?delay=<ms> postpones them, e.g. ?drop=mismatch&delay=6000 leaves time to switch to another view and check the overlay).
          if (msg.action === 'connect') {
            const params = new URLSearchParams(location.search);
            const drop = params.get('drop');
            const delay = Math.max(0, Number(params.get('delay')) || 0);
            const target = { ip: msg.ip, port: msg.port };
            clearTimeout(window.__dev_conn);
            dispatch_dev_message({ action: 'connection', state: 'connecting', ...target });
            window.__dev_conn = setTimeout(() => {
              if (drop === 'failed' || drop === 'mismatch') return dispatch_dev_message({
                action: 'connection', state: 'idle', event: 'failed', reason: drop === 'mismatch' ? MISMATCH_REASON : 'Connection timed out', ...target
              });
              dispatch_dev_message({ action: 'connection', state: 'connected', ...target });
              if (drop) window.__dev_conn = setTimeout(() => dispatch_dev_message({
                action: 'connection', state: 'idle', event: drop, reason: drop === 'kicked' ? 'Kicked by an admin: AFK too long' : '', ...target
              }), 3000);
            }, 1200 + delay);
          }
          if (msg.action === 'disconnect') {
            clearTimeout(window.__dev_conn);
            dispatch_dev_message({ action: 'connection', state: 'idle' });
          }

          // Dev only: the host's init push (component versions for Settings > About).
          if (msg.action === 'ready') dispatch_dev_message({ action: 'init', bind: 'Escape', masterlist_refresh: 15 * 1000, versions: [
            { label: 'Vital.sandbox', value: 'v0.0.0-dev' }, 
            { label: 'Vital.kit', value: 'v0.8.7' }, 
            { label: 'Vital.wry', value: 'v0.0.8' }, 
            { label: 'Vital.godot', value: '4.7.2-stable' }
          ] });

          // Dev only: outdated components are simulated by default (?update=none hides them, ?update=error makes every download fail).
          if (msg.action === 'ready' && new URLSearchParams(location.search).get('update') !== 'none') {
            window.__dev_updates = [
              { name: 'Vital.sandbox', current: 'v1.0.0', latest: 'v1.1.0', url: 'https://github.com/ov-studio/Vital.sandbox/releases' },
              { name: 'Vital.kit',     current: 'v0.8.7', latest: 'v0.8.8', url: 'https://github.com/ov-studio/Vital.kit/releases' }
            ];
            dispatch_dev_message({ action: 'update', updates: window.__dev_updates });
          }

          // Dev only: simulate the update flow (Download -> progress -> Restart & Install).
          if (msg.action === 'update_download' || msg.action === 'update_apply') {
            const patch = (match, fields) => {
              window.__dev_updates = window.__dev_updates.map((u) => match(u) ? { ...u, ...fields } : u);
              dispatch_dev_message({ action: 'update', updates: window.__dev_updates });
            };
            if (msg.action === 'update_apply') patch((u) => u.state === 'ready', { state: 'installing', message: 'Installing…' });
            else {
              const fail = new URLSearchParams(location.search).get('update') === 'error';
              const total = 48 * 1048576;
              let received = 0;
              const timer = setInterval(() => {
                received = Math.min(total, received + total / 30);
                if (fail && received > total / 2) {
                  clearInterval(timer);
                  patch((u) => u.name === msg.name, { state: 'error', message: 'Download failed' });
                } else if (received >= total) {
                  clearInterval(timer);
                  patch((u) => u.name === msg.name, { state: 'ready', message: 'Ready to install' });
                } else patch((u) => u.name === msg.name, { state: 'downloading', received, total, message: '' });
              }, 100);
            }
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
