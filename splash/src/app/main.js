import * as icons     from './icons.js';
import * as animation from './animation.js';
import * as config    from './config.js';
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
  new Function(await (await fetch('/kit')).text())();

  window.ipc = {
    postMessage(json) {
      console.log('[ipc -> godot]', JSON.parse(json));
    }
  };

  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('message', {
      detail: JSON.stringify({ action: 'init' })
    }));
  }, 1);
}


// Apply configurable stroke widths as CSS custom properties so both
// .v-stroke and .g-stroke pick them up without hardcoded values.
// The jaw path has an internal matrix(4.162611…) transform, so its
// stroke-width must be divided by that factor to match the body visually.
const GODOT_JAW_MATRIX_SCALE = 4.162611;
document.documentElement.style.setProperty('--sw-vital', config.STROKE_WIDTH_VITAL);
document.documentElement.style.setProperty('--sw-godot', config.STROKE_WIDTH_GODOT);
document.documentElement.style.setProperty('--sw-godot-jaw', (config.STROKE_WIDTH_GODOT / GODOT_JAW_MATRIX_SCALE).toFixed(4));
document.getElementById('vital-seq').innerHTML = icons.VITAL;
document.getElementById('godot-seq').innerHTML = icons.GODOT;

document.addEventListener('message', (e) => {
  const data = JSON.parse(e.detail);
  if (data.action === 'init') animation.run();
});

window.ipc.postMessage(JSON.stringify({ 
  action: 'ready' 
}));

window.addEventListener('splash:hide', () => {
  window.ipc.postMessage(JSON.stringify({ 
    action: 'hide' 
  }));
});

