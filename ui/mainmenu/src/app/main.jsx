import * as react_dom_client from 'react-dom/client';
import * as app_mainmenu     from './components/mainmenu/index.jsx';
import * as app_events       from './events.js';
import * as app_config       from './config.js';
import * as shared_dev_ipc   from '../../../../shared/dev-ipc.js';
import '../../../../shared/no-drag.js';
import '../../../../shared/no-tab.js';
import './index.css';

await shared_dev_ipc.install_dev_ipc_stub();

document.addEventListener('keydown', (e) => {
  const bind = app_events.get_bind();
  if (!bind || e.repeat || e.defaultPrevented) return;
  if (e.key !== (window.to_key ? window.to_key(bind) : bind)) return;
  app_events.escape();
});

const page = document.documentElement;
let fade_timer;

window.addEventListener('mainmenu:fadeout', () => {
  page.classList.add('is-faded');
  clearTimeout(fade_timer);
  fade_timer = setTimeout(app_events.hide, app_config.FADE_MS);
});

window.addEventListener('webview:visible', (e) => {
  if (!e.detail?.visible) return;
  clearTimeout(fade_timer);
  requestAnimationFrame(() => page.classList.remove('is-faded'));
});

app_events.ready();

const root = react_dom_client.createRoot(document.getElementById('root'));
root.render(<app_mainmenu.MainMenu/>);
