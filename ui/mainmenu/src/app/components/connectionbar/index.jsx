import * as lucide               from 'lucide-react';
import * as shared_ui_badge      from '@ui/badge';
import * as shared_ui_button     from '@ui/button';
import * as shared_ui_iconbutton from '@ui/iconbutton';
import * as app_pic              from '../pic/index.jsx';
import * as app_data             from '../../data/index.jsx';
import * as app_events           from '../../events.js';
import * as app_hooks            from '../../hooks.js';
import './index.css';

const STATUS = {
  connecting: { icon: lucide.LoaderCircle, action: 'Connecting…', spin: true },
  connected:  { icon: lucide.Wifi,         action: 'Disconnect', spin: false },
};

const NOTICE = {
  kicked: { icon: lucide.Ban,           title: 'Kicked from server',     fallback: 'You were removed from the server.' },
  lost:   { icon: lucide.WifiOff,       title: 'Connection lost',        fallback: 'The connection to the server was interrupted.' },
  failed: { icon: lucide.TriangleAlert, title: 'Could not connect',      fallback: 'The server did not respond.' },
};

function Status({ connection }) {
  const { icon: Icon, action, spin } = STATUS[connection.state];
  const address = `${connection.ip}:${connection.port}`;
  const server  = app_data.useConnectedServer(connection);

  return (
    <section className={`connbar is-${connection.state}`} aria-live="polite">
      <div className="connbar-icon">
        <app_pic.Pic src={spin ? null : server?.logo} className="connbar-logo">
          <Icon size={20} strokeWidth={2} className={spin ? 'connbar-spin' : undefined}/>
        </app_pic.Pic>
      </div>
      <div className="connbar-info">
        <span className="connbar-name">{connection.name || address}</span>
        {connection.name ? <span className="connbar-meta">{address}</span> : null}
      </div>
      <shared_ui_button.Button variant="action" danger className="connbar-btn" onClick={app_events.disconnect}>
        <lucide.Unplug size={13}/>
        {action}
      </shared_ui_button.Button>
    </section>
  );
}

function Notice({ notice }) {
  const { icon: Icon, title, fallback } = NOTICE[notice.kind] ?? NOTICE.lost;
  const where = notice.name || (notice.ip ? `${notice.ip}:${notice.port}` : '');

  return (
    <section className="connbar connbar--alert" role="alert">
      <div className="connbar-icon"><Icon size={20} strokeWidth={2}/></div>
      <div className="connbar-info">
        <span className="connbar-status">{title}</span>
        <span className="connbar-name">{where || 'Server'}</span>
        <span className="connbar-meta">{notice.reason || fallback}</span>
      </div>
      <shared_ui_iconbutton.IconButton
        className="connbar-close"
        icon={lucide.X}
        iconProps={{ size: 14, strokeWidth: 2.5 }}
        title="Dismiss"
        onClick={app_events.dismiss_notice}
      />
    </section>
  );
}

export function ConnectionBar() {
  const connection = app_data.useConnection();
  const notice     = app_hooks.useEventState('mainmenu:notice', app_events.get_notice);
  const active     = connection.state in STATUS;
  if (!active && !notice) return null;

  return (
    <section className="play-section connbars">
      <shared_ui_badge.Badge className="play-badge">Connection</shared_ui_badge.Badge>
      <div className="connbar-list">
        {active ? <Status connection={connection}/> : null}
        {notice ? <Notice notice={notice}/> : null}
      </div>
    </section>
  );
}
