import { ExternalLink, Download, X } from 'lucide-react';
import { Brand }      from '@ui/brand';
import { Button }     from '@ui/button';
import { IconButton } from '@ui/iconbutton';
import './index.css';

const LINKS = ['Documentation', 'Discord', 'Donate'];

function is_interactive(target) {
  return Boolean(target.closest('button, a, input, textarea, select, [data-no-drag]'));
}

/* Empty areas of the top bar start a borderless window drag via C++. */
function on_bar_mouse_down(e) {
  if (e.button !== 0) return;
  if (is_interactive(e.target)) return;
  e.preventDefault();
  window.ipc?.postMessage(JSON.stringify({ action: 'drag' }));
}

/* Top bar: brand, greeting, external links, downloads and exit. */
export function Hud() {
  return (
    <header className="hud" onMouseDown={on_bar_mouse_down}>
      <div className="hud-logo" data-no-drag>
        <Brand size="xs" variant="logo-only" />
      </div>
      <div className="hud-greet">Greetings, <strong>FallingStickman</strong></div>
      <nav className="hud-links" data-no-drag>
        {LINKS.map(label => (
          <Button key={label} variant="action" size="lg">
            {label} <ExternalLink size={10} />
          </Button>
        ))}
      </nav>
      <IconButton data-no-drag icon={Download} iconProps={{ size: 15, strokeWidth: 2.2 }} title="Downloads" />
      <IconButton data-no-drag className="hud-exit" icon={X} iconProps={{ size: 15, strokeWidth: 2.2 }} title="Exit Game" />
    </header>
  );
}
