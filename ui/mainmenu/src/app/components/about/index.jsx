import * as lucide     from 'lucide-react';
import * as app_events from '../../events.js';
import * as app_hooks  from '../../hooks.js';
import './index.css';

export function About() {
  const { open, toggle, root } = app_hooks.usePopover();
  const versions = app_hooks.useEventState('mainmenu:init', app_events.get_versions);

  return (
    <div className="about" ref={root} data-no-drag>
      <button
        type="button"
        className={`ui-icon-btn${open ? ' is-open' : ''}`}
        aria-label="About"
        onClick={toggle}
      >
        <lucide.Info size={15} strokeWidth={2.2}/>
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
