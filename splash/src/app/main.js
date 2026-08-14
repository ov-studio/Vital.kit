import { GODOT_SVG, SANDBOX_SVG } from './icons.js';
import { run }                    from './animation.js';
import './index.css';

// Inject SVG markup into the placeholder divs
document.getElementById('godot-seq').innerHTML   = GODOT_SVG;
document.getElementById('sandbox-seq').innerHTML = SANDBOX_SVG;

// Dev stub — mirrors the console pattern.
// Vite strips this block entirely in production builds.
if (import.meta.env.DEV) {
  if (!window.ipc) {
    window.ipc = {
      postMessage(json) {
        console.log('[ipc -> godot]', JSON.parse(json));
      }
    };
  }
}

run();
