import * as icons          from './icons.js';
import * as animation      from './animation.js';
import * as config         from './config.js';
import * as shared_dev_ipc from '../../../shared/dev-ipc.js';
import './index.css';


if (import.meta.env.DEV) {
  await shared_dev_ipc.install_dev_ipc_stub();
  setTimeout(() => shared_dev_ipc.dispatch_dev_message({ action: 'init' }), 1);
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

