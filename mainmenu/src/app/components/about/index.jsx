import { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import * as events from '../../events.js';
import './index.css';

/* Info button in the top bar: opens a panel with the component versions (Sandbox, Kit, Wry, Godot). */
export function About() {
  const [open, setOpen]         = useState(false);
  const [versions, setVersions] = useState(events.get_versions);
  const root = useRef(null);

  useEffect(() => {
    const on_init = () => setVersions(events.get_versions());
    on_init();
    window.addEventListener('mainmenu:init', on_init);
    return () => window.removeEventListener('mainmenu:init', on_init);
  }, []);

  useEffect(() => {
    if (!open) return;
    const on_down = (e) => { if (root.current && !root.current.contains(e.target)) setOpen(false); };
    const on_key = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', on_down);
    document.addEventListener('keydown', on_key);
    return () => {
      document.removeEventListener('mousedown', on_down);
      document.removeEventListener('keydown', on_key);
    };
  }, [open]);

  return (
    <div className="about" ref={root} data-no-drag>
      <button
        type="button"
        className={`ui-icon-btn${open ? ' is-open' : ''}`}
        aria-label="About"
        onClick={() => setOpen((v) => !v)}
      >
        <Info size={15} strokeWidth={2.2} />
      </button>

      {open && (
        <div className="about-panel" role="dialog" aria-label="About">
          <div className="about-meta">
            <div className="about-heading">About</div>
            <div className="about-sub">Component versions</div>
          </div>
          <ul className="about-list">
            {versions.map((v) => (
              <li key={v.label} className="about-row">
                <span className="about-label">{v.label}</span>
                <span className="about-value">{v.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
