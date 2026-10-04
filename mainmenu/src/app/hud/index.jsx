import { ExternalLink, Download, X } from 'lucide-react';
import { Brand }      from '@ui/brand';
import { Button }     from '@ui/button';
import { IconButton } from '@ui/iconbutton';
import './index.css';

const LINKS = ['Documentation', 'Discord', 'Donate'];

/* Top bar: brand, greeting, external links, downloads and exit. */
export function Hud() {
  return (
    <header className="hud">
      <div className="hud-logo">
        <Brand size="xs" variant="logo-only" />
      </div>
      <div className="hud-greet">Greetings, <strong>FallingStickman</strong></div>
      <nav className="hud-links">
        {LINKS.map(label => (
          <Button key={label} variant="action" size="lg">
            {label} <ExternalLink size={10} />
          </Button>
        ))}
      </nav>
      <IconButton icon={Download} iconProps={{ size: 15, strokeWidth: 2.2 }} title="Downloads" />
      <IconButton className="hud-exit" icon={X} iconProps={{ size: 15, strokeWidth: 2.2 }} title="Exit Game" />
    </header>
  );
}
