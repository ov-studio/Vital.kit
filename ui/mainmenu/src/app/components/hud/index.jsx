import { ExternalLink, Minus, X } from 'lucide-react';
import { Brand }      from '@ui/brand';
import { Button }     from '@ui/button';
import { IconButton } from '@ui/iconbutton';
import { About }         from '../about/index.jsx';
import { Label }         from '../icons/index.jsx';
import { Notifications } from '../notifications/index.jsx';
import * as events    from '../../events.js';
import * as config    from '../../config.js';
import { useEventState } from '../../hooks.js';
import './index.css';

function is_interactive(target) {
  return Boolean(target.closest('button, a, input, textarea, select, [data-no-drag]'));
}

function on_bar_mouse_down(e) {
  if (e.button !== 0) return;
  if (is_interactive(e.target)) return;
  e.preventDefault();
  events.drag();
}

export function Hud() {
  const username = useEventState('mainmenu:username', events.get_username) || 'Player';
  const updates  = useEventState('mainmenu:update', events.get_updates);

  return (
    <header className="hud" onMouseDown={on_bar_mouse_down}>
      <div className="hud-logo" data-no-drag>
        <Brand size="xs" variant="logo-only" />
      </div>
      <div className="hud-greet">Greetings, <strong>{username}</strong></div>
      <nav className="hud-links" data-no-drag>
        {config.LINKS.map(({ label, url }) => (
          <Button key={label} variant="action" size="lg" onClick={() => events.open_url(url)}>
            <Label after={ExternalLink} size={11}>{label}</Label>
          </Button>
        ))}
      </nav>
      <Notifications updates={updates} />
      <About />
      <IconButton
        data-no-drag
        icon={Minus}
        iconProps={{ size: 15, strokeWidth: 2.2 }}
        title="Minimize"
        onClick={() => events.minimize()}
      />
      <IconButton
        data-no-drag
        className="hud-exit"
        icon={X}
        iconProps={{ size: 15, strokeWidth: 2.2 }}
        title="Exit Game"
        onClick={() => events.exit()}
      />
    </header>
  );
}
