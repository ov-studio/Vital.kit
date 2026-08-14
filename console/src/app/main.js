import * as icons     from './icons.js';
import * as animation from './animation.js';
import './index.css';

document.getElementById('godot-seq').innerHTML   = icons.GODOT_SVG;
document.getElementById('sandbox-seq').innerHTML = icons.SANDBOX_SVG;

// Dev stub — simulates the Godot WebView environment for `npm run dev`.
// Vite strips this block entirely from production builds.
if (import.meta.env.DEV) {
  // Load Vital.kit so theme CSS variables are available, as in the real WebView.
  new Function(await (await fetch('/kit')).text())();

  // Stub ipc so postMessage calls log to console instead of throwing.
  window.ipc = {
    postMessage(json) {
      console.log('[ipc -> godot]', JSON.parse(json));
    }
  };

  // Simulate the C++ "start" reply. Deferred so the listener below is
  // registered first.
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('message', {
      detail: JSON.stringify({ action: 'start' })
    }));
  }, 0);
}

document.addEventListener('message', (e) => {
  const data = JSON.parse(e.detail);
  if (data.action === 'start') animation.run();
});

// "splash-done" fires when the fade-to-transparent finishes.
window.addEventListener('splash-done', () => {
  window.ipc.postMessage(JSON.stringify({ action: 'done' }));
});

window.ipc.postMessage(JSON.stringify({ action: 'ready' }));
