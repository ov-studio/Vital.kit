import * as react       from 'react-dom/client';
import * as app_console from './console.jsx';
import { install_dev_ipc_stub, dispatch_dev_message } from '../../../shared/dev-ipc.js';
import './index.css';


if (import.meta.env.DEV) {
  await install_dev_ipc_stub();

  window.addEventListener('console-mounted', () => {
    dispatch_dev_message({
      action: 'init',
      bind: 'f1',
      types: {
        debug: { label: 'Debug', badge: 'DEBUG', color: [150, 150, 160], priority: 0 },
        info:  { label: 'Info',  badge: 'INFO',  color: [120, 170, 255], priority: 1 },
        warn:  { label: 'Warn',  badge: 'WARN',  color: [255, 190, 90],  priority: 2 },
        error: { label: 'Error', badge: 'ERROR', color: [255, 100, 100], priority: 3 }
      }
    });

    const sample_logs = [
      { mode: 'info',  message: 'Vital.sandbox boot sequence started' },
      { mode: 'debug', message: 'Loaded module `vm_module` with scope `core.thread`' },
      { mode: 'info',  message: 'Resource group `world_assets` ready (12/12)' },
      { mode: 'warn',  message: 'Texture `player_atlas.dds` missing mip levels, falling back to `auto`' },
      { mode: 'error', message: 'Failed to bind `event.on` handler:\n> stack overflow in `signal()`\n> at Manager::Sandbox::dispatch' },
      { mode: 'error', message: 'Failed to bind `event.on` handler:\n> stack overflow in `signal(\n\ta, \n\tb\n)`\n at Manager::Sandbox::dispatch' },
      { mode: 'info',  message: 'Connected to server as `client_07`' },
    ];

    sample_logs.forEach((log, i) => {
      setTimeout(() => dispatch_dev_message({ action: 'print', ...log }), 300 * (i + 1));
    });

    setTimeout(() => dispatch_dev_message({ action: 'print', mode: 'warn', message: 'Texture `player_atlas.dds` missing mip levels, falling back to `auto`' }), 2600);
    setTimeout(() => dispatch_dev_message({ action: 'print', mode: 'warn', message: 'Texture `player_atlas.dds` missing mip levels, falling back to `auto`' }), 2900);

    setTimeout(() => {
      const spam_messages = [
        { mode: 'info',  message: 'drawing' },
        { mode: 'debug', message: 'tick: frame update' },
        { mode: 'warn',  message: 'slow frame detected' },
        { mode: 'error', message: 'Failed to bind `event.on` handler:\n> stack overflow in `signal()`\n> at Manager::Sandbox::dispatch' },
      ];
      let spam_i = 0;
      setInterval(() => {
        dispatch_dev_message({ action: 'print', ...spam_messages[spam_i % spam_messages.length] });
        spam_i++;
      }, 50);
    }, 2900);
  });
}


// Globally disable Tab-driven focus traversal across the entire console.
// Capture phase (the `true` third arg) means this fires before React or
// any element's own handlers see the event, so Tab is suppressed no
// matter what gets added to the component tree later.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') e.preventDefault();
}, true);


const root = react.createRoot(document.getElementById('root'));
root.render(<app_console.Console/>);
