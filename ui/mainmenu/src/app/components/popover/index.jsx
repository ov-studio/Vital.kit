import * as shared_ui_badge from '@ui/badge';
import * as app_hooks      from '../../hooks.js';
import './index.css';

export function Popover({ icon: Icon, title, sub, label = title, badge, className = '', children }) {
  const { open, toggle, root } = app_hooks.usePopover();

  return (
    <div className={`pop ${className}`.trim()} ref={root} data-no-drag>
      <button type="button" className={`ui-icon-btn${open ? ' is-open' : ''}`} aria-label={label} onClick={toggle}>
        <Icon size={15} strokeWidth={2.2}/>
        {badge && <shared_ui_badge.Badge className="pop-badge">{badge}</shared_ui_badge.Badge>}
      </button>

      {open && (
        <div className="pop-panel" role="dialog" aria-label={title}>
          <div className="pop-meta">
            <div className="pop-heading">{title}</div>
            <div className="pop-sub">{sub}</div>
          </div>
          {children}
        </div>
      )}
    </div>
  );
}
