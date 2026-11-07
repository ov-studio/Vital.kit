import * as lucide      from 'lucide-react';
import * as app_popover from '../popover/index.jsx';
import * as app_events  from '../../events.js';
import * as app_hooks   from '../../hooks.js';
import './index.css';

export function About() {
  const versions = app_hooks.useEventState('mainmenu:init', app_events.get_versions);

  return (
    <app_popover.Popover className="about" icon={lucide.Info} title="About" sub="Component versions">
      <ul className="pop-list">
        {versions.map((v) => (
          <li key={v.label} className="pop-row about-row">
            <span className="pop-label">{v.label}</span>
            <span className="about-value">{v.value}</span>
          </li>
        ))}
      </ul>
    </app_popover.Popover>
  );
}
