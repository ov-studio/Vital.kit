import * as react from 'react-dom/client';
import * as app_console from './console.jsx';
import './theme.css';
import './index.css';


// In production this page runs inside a Godot WebView. Godot injects a
// global `ipc` object (for outgoing messages) and dispatches a "message"
// CustomEvent on `document` (for incoming data: init/print/clear). Neither
// exists in a plain browser, so during `npm run dev` this stubs `ipc` and
// fires fake events so the console UI has something to show.
//
// import.meta.env.DEV is true only for `npm run dev` - Vite's production
// build (`npm run build`) statically strips this entire block out, so it
// never ships to Godot. No manual cleanup needed.
if (import.meta.env.DEV) {
  if (!window.ipc) {
    window.ipc = {
      postMessage(json) {
        console.log('[ipc -> godot]', JSON.parse(json));
      }
    };
  }

  const send = (action_payload) => {
    document.dispatchEvent(new CustomEvent('message', {
      detail: JSON.stringify(action_payload)
    }));
  };

  window.addEventListener('console-mounted', () => {
    send({
      action: 'init',
      bind: 'f1',
      types: {
        debug: { label: 'Debug', badge: 'DEBUG', color: [150, 150, 160], priority: 0 },
        info: { label: 'Info', badge: 'INFO', color: [120, 170, 255], priority: 1 },
        warn: { label: 'Warn', badge: 'WARN', color: [255, 190, 90], priority: 2 },
        error: { label: 'Error', badge: 'ERROR', color: [255, 100, 100], priority: 3 },
      }
    });

    const sample_logs = [
      { mode: 'info', message: 'Vital.sandbox boot sequence started' },
      { mode: 'debug', message: 'Loaded module `vm_module` with scope `core.thread`' },
      { mode: 'info', message: 'Resource group `world_assets` ready (12/12)' },
      { mode: 'warn', message: 'Texture `player_atlas.dds` missing mip levels, falling back to `auto`' },
      { mode: 'error', message: 'Failed to bind `event.on` handler:\n> stack overflow in `signal()`\n> at Manager::Sandbox::dispatch' },
      { mode: 'error', message: 'Failed to bind `event.on` handler:\n> stack overflow in `signal(\n\ta, \n\tb\n)`\n> at Manager::Sandbox::dispatch' },
      { mode: 'info', message: 'Connected to server as `client_07`' },
    ];

    sample_logs.forEach((log, i) => {
      setTimeout(() => send({ action: 'print', ...log }), 300 * (i + 1));
    });

    // Demonstrates repeat/debounce grouping (same message sent twice quickly)
    setTimeout(() => send({ action: 'print', mode: 'warn', message: 'Texture `player_atlas.dds` missing mip levels, falling back to `auto`' }), 2600);
    setTimeout(() => send({ action: 'print', mode: 'warn', message: 'Texture `player_atlas.dds` missing mip levels, falling back to `auto`' }), 2900);

    // Spam simulation - fires after sample logs settle, runs for 10 seconds.
    // Mimics the high-frequency log bursts that cause filter clicks to lag.
    const spam_messages = [
      { mode: 'info', message: 'drawing' },
      { mode: 'debug', message: 'tick: frame update' },
      { mode: 'warn', message: 'slow frame detected' },
    ];
    let spam_i = 0;
    const spam = setInterval(() => {
      send({ action: 'print', ...spam_messages[spam_i % spam_messages.length] });
      spam_i++;
    }, 1);
    setTimeout(() => clearInterval(spam), 10000);
  });
}


// Globally disable Tab-driven focus traversal across the entire console.
// Capture phase (the `true` third arg) means this fires before React or
// any element's own handlers see the event, so Tab is suppressed no
// matter what gets added to the component tree later - no need to set
// tabIndex={-1} on individual elements one by one.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') e.preventDefault();
}, true);


const root = react.createRoot(document.getElementById('root'));
root.render(<app_console.Console/>);
