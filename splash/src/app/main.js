import * as animation      from './animation.js';
import * as config         from './config.js';
import * as shared_dev_ipc from '../../../shared/dev-ipc.js';
import './index.css';

if (import.meta.env.DEV) {
  await shared_dev_ipc.install_dev_ipc_stub();
  setTimeout(() => shared_dev_ipc.dispatch_dev_message({ action: 'init' }), 1);
}

document.documentElement.style.setProperty('--sw-vital', config.STROKE_WIDTH_VITAL);

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
