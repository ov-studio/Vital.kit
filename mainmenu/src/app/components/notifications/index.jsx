import { Bell, Download, RotateCw, ExternalLink, TriangleAlert } from 'lucide-react';
import { Button } from '@ui/button';
import * as events from '../../events.js';
import { usePopover } from '../../hooks.js';
import './index.css';

const mb = (n) => (n / 1048576).toFixed(1);

function percent(u) {
  return u.total > 0 ? Math.min(100, Math.floor((u.received / u.total) * 100)) : 0;
}

function UpdateItem({ u }) {
  const state = u.state || 'idle';
  const busy = state === 'downloading' || state === 'installing';

  return (
    <li className="notif-item">
      <div className="notif-item-head">
        <span className="notif-item-name">{u.name}</span>
        <span className="notif-item-ver">{u.current} → <strong>{u.latest}</strong></span>
      </div>

      {state === 'downloading' && (
        <>
          <div className="notif-bar"><div className="notif-bar-fill" style={{ width: `${percent(u)}%` }} /></div>
          <div className="notif-item-meta">
            {u.message || (u.total > 0 ? `${mb(u.received)} / ${mb(u.total)} MB · ${percent(u)}%` : `${mb(u.received)} MB`)}
          </div>
        </>
      )}
      {state === 'installing' && <div className="notif-item-meta">{u.message || 'Installing…'}</div>}
      {state === 'ready' && <div className="notif-item-meta is-ok">{u.message || 'Ready to install'}</div>}
      {state === 'error' && (
        <div className="notif-item-meta is-err"><TriangleAlert size={11} /> {u.message || 'Update failed'}</div>
      )}

      <div className="notif-item-actions">
        {(state === 'idle' || state === 'error') && (
          <Button variant="action" onClick={() => events.update_download(u.name)}>
            <Download size={11} /> {state === 'error' ? 'Retry' : 'Download'}
          </Button>
        )}
        {state === 'ready' && (
          <Button variant="action" onClick={() => events.update_apply()}>
            <RotateCw size={11} /> Restart &amp; Install
          </Button>
        )}
        {busy && <Button variant="action" disabled>{state === 'installing' ? 'Installing…' : 'Downloading…'}</Button>}
        {u.url && (
          <Button variant="secondary" onClick={() => events.open_url(u.url)}>
            Release notes <ExternalLink size={10} />
          </Button>
        )}
      </div>
    </li>
  );
}

/* Bell button with a NEW badge while updates exist; opens a panel to download and install them. */
export function Notifications({ updates }) {
  const { open, toggle, root } = usePopover();
  const has = updates.length > 0;

  return (
    <div className="notif" ref={root} data-no-drag>
      <button
        type="button"
        className={`ui-icon-btn notif-btn${open ? ' is-open' : ''}`}
        aria-label={has ? 'Notifications: updates available' : 'Notifications'}
        onClick={toggle}
      >
        <Bell size={15} strokeWidth={2.2} />
        {has && <span className="notif-badge">NEW</span>}
      </button>

      {open && (
        <div className="notif-panel" role="dialog" aria-label="Notifications">
          <div className="notif-meta">
            <div className="notif-heading">Notifications</div>
            <div className="notif-sub">
              {has ? `${updates.length} update${updates.length > 1 ? 's' : ''} available` : 'Nothing new'}
            </div>
          </div>
          {has ? (
            <ul className="notif-list">
              {updates.map((u) => <UpdateItem key={u.name} u={u} />)}
            </ul>
          ) : (
            <div className="notif-empty">You're all caught up.</div>
          )}
        </div>
      )}
    </div>
  );
}
