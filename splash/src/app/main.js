import { GODOT_SVG, SANDBOX_SVG } from './icons.js';
import { run }                    from './animation.js';
import './index.css';

// Inject SVG markup into the placeholder divs
document.getElementById('godot-seq').innerHTML   = GODOT_SVG;
document.getElementById('sandbox-seq').innerHTML = SANDBOX_SVG;

// In production this page runs inside a Godot WebView. Godot injects a
// global `ipc` object (for outgoing messages to C++) and dispatches a
// "message" CustomEvent on `document` (for incoming data from C++).
//
// The splash IPC flow is:
//   1. Page loads → JS sends  { action: "ready" }  to C++
//   2. C++ replies with       { action: "start" }  once Vital.kit is loaded
//   3. JS runs the full animation sequence
//   4. Animation ends → JS sends { action: "done" } so C++ destroys the webview
//
// Neither `ipc` nor the "message" event exist in a plain browser, so during
// `npm run dev` this block stubs both and simulates the C++ "start" reply so
// the animation plays without Godot.
//
// import.meta.env.DEV is true only for `npm run dev` — Vite's production
// build (`npm run build`) statically strips this entire block out, so it
// never ships to Godot. No manual cleanup needed.
if (import.meta.env.DEV) {
  // Load Vital.kit so theme CSS variables and any kit globals are available,
  // exactly as they are inside the real WebView at runtime.
  new Function(await (await fetch('/kit')).text())();

  if (!window.ipc) {
    window.ipc = {
      postMessage(json) {
        console.log('[ipc -> godot]', JSON.parse(json));
      }
    };
  }

  // Simulate the C++ "start" reply. We wait for "splash-ready" (fired below
  // after the message listener is attached) so the event never races the handler.
  window.addEventListener('splash-ready', () => {
    document.dispatchEvent(new CustomEvent('message', {
      detail: JSON.stringify({ action: 'start' })
    }));
  });
}

// Listen for incoming messages from C++ (or the dev stub above).
// "start" → kick off the animation.
document.addEventListener('message', (e) => {
  const data = JSON.parse(e.detail);
  if (data.action === 'start') run();
});

// Animation fires "splash-done" when the curtain fade finishes.
// Send { action: "done" } so C++ can destroy the webview.
window.addEventListener('splash-done', () => {
  window.ipc.postMessage(JSON.stringify({ action: 'done' }));
});

// Signal C++ (or the dev stub) that the page is ready and waiting.
// C++ will reply with { action: "start" } once Vital.kit is confirmed loaded.
window.ipc.postMessage(JSON.stringify({ action: 'ready' }));

// Let the dev stub know the message listener is now attached and it is
// safe to dispatch the synthetic "start" event. Harmless in production —
// nothing inside Godot listens for this custom window event.
window.dispatchEvent(new Event('splash-ready'));
