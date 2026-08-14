import * as icons     from './icons.js';
import * as animation from './animation.js';
import './index.css';

document.getElementById('godot-seq').innerHTML   = icons.GODOT_SVG;
document.getElementById('sandbox-seq').innerHTML = icons.SANDBOX_SVG;

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
  }, 0);
}

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

