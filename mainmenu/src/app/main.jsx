import * as react          from 'react-dom/client';
import * as app_mainmenu   from './components/mainmenu/index.jsx';
import * as events         from './events.js';
import * as shared_dev_ipc from '../../../shared/dev-ipc.js';
import './index.css';

await shared_dev_ipc.install_dev_ipc_stub();

// Globally disable Tab-driven focus traversal (mirrors console behaviour).
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') e.preventDefault();
}, true);

// Esc: host fades the menu out (revealing the game) and brings it back on the next Esc.
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || e.repeat || e.defaultPrevented) return;
  events.escape();
});

const FADE_MS = 220;
const page = document.documentElement;
let fade_timer;

window.addEventListener('mainmenu:fadeout', () => {
  page.classList.add('is-faded');
  clearTimeout(fade_timer);
  fade_timer = setTimeout(events.hide, FADE_MS);
});

// Host showed the webview again: drop the class so it fades back in.
window.addEventListener('webview:visible', (e) => {
  if (!e.detail?.visible) return;
  clearTimeout(fade_timer);
  requestAnimationFrame(() => page.classList.remove('is-faded'));
});

events.ready();

const root = react.createRoot(document.getElementById('root'));
root.render(<app_mainmenu.MainMenu />);
