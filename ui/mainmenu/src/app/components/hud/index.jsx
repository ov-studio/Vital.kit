import * as lucide               from 'lucide-react';
import * as shared_ui_brand      from '@ui/brand';
import * as shared_ui_button     from '@ui/button';
import * as shared_ui_iconbutton from '@ui/iconbutton';
import * as app_about            from '../about/index.jsx';
import * as app_notifications    from '../notifications/index.jsx';
import * as app_events           from '../../events.js';
import * as app_config           from '../../config.js';
import * as app_hooks            from '../../hooks.js';
import './index.css';

function is_interactive(target) {
  return Boolean(target.closest('button, a, input, textarea, select, [data-no-drag]'));
}

function on_bar_mouse_down(e) {
  if (e.button !== 0) return;
  if (is_interactive(e.target)) return;
  e.preventDefault();
  app_events.drag();
}

export function Hud() {
  const username = app_hooks.useEventState('mainmenu:username', app_events.get_username) || 'Player';
  const updates  = app_hooks.useEventState('mainmenu:update', app_events.get_updates);

  return (
    <header className="hud" onMouseDown={on_bar_mouse_down}>
      <div className="hud-logo" data-no-drag>
        <shared_ui_brand.Brand size="xs" variant="logo-only"/>
      </div>
      <div className="hud-greet">Greetings, <strong>{username}</strong></div>
      <nav className="hud-links" data-no-drag>
        {app_config.LINKS.map(({ label, url }) => (
          <shared_ui_button.Button key={label} variant="action" size="lg" onClick={() => app_events.open_url(url)}>
            {label} <lucide.ExternalLink size={11}/>
          </shared_ui_button.Button>
        ))}
      </nav>
      <app_notifications.Notifications updates={updates}/>
      <app_about.About/>
      <shared_ui_iconbutton.IconButton
        data-no-drag
        className="hud-min"
        icon={lucide.Minus}
        iconProps={{ size: 15, strokeWidth: 2.2 }}
        title="Minimize"
        onClick={() => app_events.minimize()}
      />
      <shared_ui_iconbutton.IconButton
        data-no-drag
        className="hud-exit"
        icon={lucide.X}
        iconProps={{ size: 15, strokeWidth: 2.2 }}
        title="Exit Game"
        onClick={() => app_events.exit()}
      />
    </header>
  );
}
