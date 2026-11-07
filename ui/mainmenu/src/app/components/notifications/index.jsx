import * as lucide           from 'lucide-react';
import * as shared_ui_button from '@ui/button';
import * as app_popover      from '../popover/index.jsx';
import * as app_events       from '../../events.js';
import './index.css';

const mb = (n) => (n / 1048576).toFixed(1);

function percent(u) {
  return u.total > 0 ? Math.min(100, Math.floor((u.received / u.total) * 100)) : 0;
}

function UpdateItem({ u }) {
  const state = u.state || 'idle';
  const busy = state === 'downloading' || state === 'installing';

  return (
    <li className="pop-row notif-item">
      <div className="notif-item-head">
        <span className="pop-label">{u.name}</span>
        <span className="notif-item-ver">{u.latest}</span>
      </div>

      {state === 'downloading' && (
        <>
          <div className="notif-bar"><div className="notif-bar-fill" style={{ width: `${percent(u)}%` }}/></div>
          <div className="notif-item-meta">
            {u.message || (u.total > 0 ? `${mb(u.received)} / ${mb(u.total)} MB · ${percent(u)}%` : `${mb(u.received)} MB`)}
          </div>
        </>
      )}
      {state === 'installing' && <div className="notif-item-meta">{u.message || 'Installing…'}</div>}
      {state === 'ready' && <div className="notif-item-meta is-ok">{u.message || 'Ready to install'}</div>}
      {state === 'error' && (
        <div className="notif-item-meta is-err"><lucide.TriangleAlert size={12}/> {u.message || 'Update failed'}</div>
      )}

      <div className="notif-item-actions">
        {(state === 'idle' || state === 'error') && (
          <shared_ui_button.Button variant="action" onClick={() => app_events.update_download(u.name)}>
            <lucide.Download size={12}/> {state === 'error' ? 'Retry' : 'Download'}
          </shared_ui_button.Button>
        )}
        {state === 'ready' && (
          <shared_ui_button.Button variant="action" onClick={() => app_events.update_apply()}>
            <lucide.RotateCw size={12}/> Restart &amp; Install
          </shared_ui_button.Button>
        )}
        {busy && <shared_ui_button.Button variant="action" disabled>{state === 'installing' ? 'Installing…' : 'Downloading…'}</shared_ui_button.Button>}
        {u.url && (
          <shared_ui_button.Button variant="secondary" onClick={() => app_events.open_url(u.url)}>
            Release notes <lucide.ExternalLink size={11}/>
          </shared_ui_button.Button>
        )}
      </div>
    </li>
  );
}

export function Notifications({ updates }) {
  const has = updates.length > 0;

  return (
    <app_popover.Popover
      className="notif"
      icon={lucide.Bell}
      title="Notifications"
      label={has ? 'Notifications: updates available' : 'Notifications'}
      badge={has ? 'NEW' : null}
      sub={has ? `${updates.length} update${updates.length > 1 ? 's' : ''} available` : 'Nothing new'}
    >
      {has ? (
        <ul className="pop-list">
          {updates.map((u) => <UpdateItem key={u.name} u={u}/>)}
        </ul>
      ) : (
        <div className="notif-empty">You're all caught up.</div>
      )}
    </app_popover.Popover>
  );
}
