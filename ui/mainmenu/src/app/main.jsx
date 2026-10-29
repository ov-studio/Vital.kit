import * as react          from 'react-dom/client';
import * as app_mainmenu   from './components/mainmenu/index.jsx';
import * as events         from './events.js';
import * as config         from './config.js';
import * as shared_dev_ipc from '../../../../shared/dev-ipc.js';
import '../../../../shared/no-drag.js';
import './index.css';

await shared_dev_ipc.install_dev_ipc_stub();

document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') e.preventDefault();
}, true);

document.addEventListener('keydown', (e) => {
  const bind = events.get_bind();
  if (!bind || e.repeat || e.defaultPrevented) return;
  if (e.key !== (window.to_key ? window.to_key(bind) : bind)) return;
  events.escape();
});

const page = document.documentElement;
let fade_timer;

window.addEventListener('mainmenu:fadeout', () => {
  page.classList.add('is-faded');
  clearTimeout(fade_timer);
  fade_timer = setTimeout(events.hide, config.FADE_MS);
});

window.addEventListener('webview:visible', (e) => {
  if (!e.detail?.visible) return;
  clearTimeout(fade_timer);
  requestAnimationFrame(() => page.classList.remove('is-faded'));
});

events.ready();

const root = react.createRoot(document.getElementById('root'));
root.render(<app_mainmenu.MainMenu/>);
