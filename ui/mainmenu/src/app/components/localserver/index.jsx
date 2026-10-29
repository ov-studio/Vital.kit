import { Play, Server, Unplug } from 'lucide-react';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import * as events from '../../events.js';
import { LOCAL_HOST as HOST, LOCAL_SCAN_INTERVAL } from '../../config.js';
import { useEventState, usePolling } from '../../hooks.js';
import './index.css';

function useLocalServers(active) {
  const servers    = useEventState('mainmenu:localservers', events.get_localservers);
  const connection = useEventState('mainmenu:connection', events.get_connection);
  usePolling(events.scan_local_servers, LOCAL_SCAN_INTERVAL, active);
  return { servers, connection };
}

function ServerRow({ info, connection }) {
  const here      = connection.state !== 'idle' && connection.port === info.port;
  const connected = here && connection.state === 'connected';
  const busy      = here && connection.state === 'connecting';
  const players   = Number.isInteger(info.players) ? `${info.players}${info.max_peers ? ` / ${info.max_peers}` : ''} online` : null;

  return (
    <div className={`localserver${connected ? ' is-connected' : ''}`}>
      <div className="ls-thumb"><Server size={20} strokeWidth={2} /></div>
      <div className="ls-info">
        <span className="ls-name">{info.name}</span>
        {info.description ? <span className="ls-desc">{info.description}</span> : null}
      </div>
      {players ? <span className="ls-meta">{players}</span> : null}
      {here ? (
        <Button variant="action" danger className="ls-join" disabled={busy} onClick={events.disconnect}>
          <Unplug size={13} />
          {busy ? 'Connecting…' : 'Disconnect'}
        </Button>
      ) : (
        <Button variant="action" className="ls-join" onClick={() => events.connect(HOST, info.port, info.http_port)}>
          <Play size={12} strokeWidth={2.4} fill="currentColor" />
          Connect
        </Button>
      )}
    </div>
  );
}

export function LocalServers({ active }) {
  const { servers, connection } = useLocalServers(active);
  if (!servers.length) return null;

  return (
    <section className="play-section play-section--local">
      <Badge className="play-badge">Local Servers</Badge>
      <div className="ls-list">
        {servers.map((info) => (
          <ServerRow key={info.port} info={info} connection={connection} />
        ))}
      </div>
    </section>
  );
}
