import { useState, useEffect } from 'react';
import { Play, Unplug } from 'lucide-react';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import * as events from '../../events.js';
import './index.css';

const HOST = '127.0.0.1';
const POLL_MS = 3000;

/* Asks the host for the servers on this machine while `active`, and follows the live connection state.
   The host finds every running server (any port) and verifies each, so nothing is hard-coded here. */
function useLocalServers(active) {
  const [servers, setServers] = useState(events.get_localservers);
  const [connection, setConnection] = useState(events.get_connection);

  useEffect(() => {
    const on_servers = (e) => setServers(e.detail);
    const on_connection = (e) => setConnection(e.detail);
    window.addEventListener('mainmenu:localservers', on_servers);
    window.addEventListener('mainmenu:connection', on_connection);
    return () => {
      window.removeEventListener('mainmenu:localservers', on_servers);
      window.removeEventListener('mainmenu:connection', on_connection);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    events.scan_local_servers();
    const timer = setInterval(events.scan_local_servers, POLL_MS);
    return () => clearInterval(timer);
  }, [active]);

  return { servers, connection };
}

function ServerRow({ info, connection }) {
  const here      = connection.state !== 'idle' && connection.port === info.port;
  const connected = here && connection.state === 'connected';
  const busy      = here && connection.state === 'connecting';
  const players   = Number.isInteger(info.players) ? `${info.players}${info.max_peers ? ` / ${info.max_peers}` : ''} players` : null;

  return (
    <div className={`localserver${connected ? ' is-connected' : ''}`}>
      <div className="ls-info">
        <span className="ls-label">{info.description}</span>
        <span className="ls-name">{info.name}</span>
      </div>
      <span className="ls-meta">{[players, `${HOST}:${info.port}`].filter(Boolean).join('  ·  ')}</span>
      {here ? (
        <Button variant="action" danger className="ls-join" disabled={busy} onClick={events.disconnect}>
          <Unplug size={12} />
          {busy ? 'Connecting…' : 'Disconnect'}
        </Button>
      ) : (
        <Button variant="action" className="ls-join" onClick={() => events.connect(HOST, info.port, info.http_port)}>
          <Play size={11} fill="currentColor" />
          Connect
        </Button>
      )}
    </div>
  );
}

/* Play-view section: only mounts when a local server is present. */
export function LocalServers({ active }) {
  const { servers, connection } = useLocalServers(active);
  if (!servers.length) return null;
  return (
    <section className="play-section play-section--local">
      <Badge className="play-badge">Local servers</Badge>
      <div className="ls-list">
        {servers.map((info) => (
          <ServerRow key={info.port} info={info} connection={connection} />
        ))}
      </div>
    </section>
  );
}
