import { useState, useEffect } from 'react';
import { ExternalLink, Download, X } from 'lucide-react';
import { Brand }      from '@ui/brand';
import { Button }     from '@ui/button';
import { IconButton } from '@ui/iconbutton';
import * as events    from '../../events.js';
import './index.css';

const LINKS = [
  { label: 'Documentation', url: 'https://vital-sandbox.com/docs' },
  { label: 'Discord',       url: 'http://discord.vital-sandbox.com' },
  { label: 'Donate',        url: 'https://vital-sandbox.com/donate' },
];

function is_interactive(target) {
  return Boolean(target.closest('button, a, input, textarea, select, [data-no-drag]'));
}

/* Empty areas of the top bar start a borderless window drag. */
function on_bar_mouse_down(e) {
  if (e.button !== 0) return;
  if (is_interactive(e.target)) return;
  e.preventDefault();
  events.drag();
}

function on_exit() {
  events.exit();
}

/* Top bar: brand, greeting, external links, downloads and exit. */
export function Hud() {
  const [username, setUsername] = useState(() => events.get_username() || 'Player');

  useEffect(() => {
    function on_name(e) {
      if (e.detail) setUsername(e.detail);
    }
    window.addEventListener('mainmenu:username', on_name);
    const current = events.get_username();
    if (current) setUsername(current);
    return () => window.removeEventListener('mainmenu:username', on_name);
  }, []);

  const [updates, setUpdates] = useState(() => events.get_updates());
  useEffect(() => {
    function on_update(e) {
      setUpdates(Array.isArray(e.detail) ? e.detail : []);
    }
    window.addEventListener('mainmenu:update', on_update);
    setUpdates(events.get_updates());
    return () => window.removeEventListener('mainmenu:update', on_update);
  }, []);

  return (
    <header className="hud" onMouseDown={on_bar_mouse_down}>
      <div className="hud-logo" data-no-drag>
        <Brand size="xs" variant="logo-only" />
      </div>
      <div className="hud-greet">Greetings, <strong>{username}</strong></div>
      <nav className="hud-links" data-no-drag>
        {LINKS.map(({ label, url }) => (
          <Button key={label} variant="action" size="lg" onClick={() => events.open_url(url)}>
            {label} <ExternalLink size={10} />
          </Button>
        ))}
      </nav>
      {updates.length > 0 && (
        <IconButton
          data-no-drag
          icon={Download}
          iconProps={{ size: 15, strokeWidth: 2.2 }}
          title={`Update available: ${updates.map(u => `${u.name} ${u.latest}`).join(', ')}`}
          onClick={() => events.open_url(updates[0].url)}
        />
      )}
      <IconButton
        data-no-drag
        className="hud-exit"
        icon={X}
        iconProps={{ size: 15, strokeWidth: 2.2 }}
        title="Exit Game"
        onClick={on_exit}
      />
    </header>
  );
}
