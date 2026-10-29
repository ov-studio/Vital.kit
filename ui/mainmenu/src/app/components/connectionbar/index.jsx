import { Wifi, WifiOff, LoaderCircle, Unplug, Ban, TriangleAlert, X } from 'lucide-react';
import { Badge }      from '@ui/badge';
import { Button }     from '@ui/button';
import { IconButton } from '@ui/iconbutton';
import * as events    from '../../events.js';
import { useEventState } from '../../hooks.js';
import './index.css';

const STATUS = {
  connecting: { icon: LoaderCircle, label: 'Connecting', action: 'Cancel',     spin: true },
  connected:  { icon: Wifi,         label: 'Connected',  action: 'Disconnect', spin: false },
};

const NOTICE = {
  kicked: { icon: Ban,           title: 'Kicked from server',     fallback: 'You were removed from the server.' },
  lost:   { icon: WifiOff,       title: 'Connection lost',        fallback: 'The connection to the server was interrupted.' },
  failed: { icon: TriangleAlert, title: 'Could not connect',      fallback: 'The server did not respond.' },
};

function Status({ connection }) {
  const { icon: Icon, label, action, spin } = STATUS[connection.state];
  const address = `${connection.ip}:${connection.port}`;

  return (
    <section className={`connbar is-${connection.state}`} aria-live="polite">
      <div className="connbar-icon"><Icon size={20} strokeWidth={2} className={spin ? 'connbar-spin' : undefined}/></div>
      <div className="connbar-info">
        <span className="connbar-status">{label}</span>
        <span className="connbar-name">{connection.name || address}</span>
        {connection.name ? <span className="connbar-meta">{address}</span> : null}
      </div>
      <Button variant="action" danger className="connbar-btn" onClick={events.disconnect}>
        <Unplug size={13}/>
        {action}
      </Button>
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
      <IconButton
        className="connbar-close"
        icon={X}
        iconProps={{ size: 14, strokeWidth: 2.5 }}
        title="Dismiss"
        onClick={events.dismiss_notice}
      />
    </section>
  );
}

export function ConnectionBar() {
  const connection = useEventState('mainmenu:connection', events.get_connection);
  const notice     = useEventState('mainmenu:notice', events.get_notice);
  const active     = connection.state in STATUS;
  if (!active && !notice) return null;

  return (
    <section className="play-section connbars">
      <Badge className="play-badge">Connection</Badge>
      <div className="connbar-list">
        {active ? <Status connection={connection}/> : null}
        {notice ? <Notice notice={notice}/> : null}
      </div>
    </section>
  );
}
