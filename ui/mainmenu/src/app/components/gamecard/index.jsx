import { useState, useEffect } from 'react';
import { Star, Globe, Play, Ban, MessageCircle, Unplug, Server } from 'lucide-react';
import { Badge }      from '@ui/badge';
import { Button }     from '@ui/button';
import { Card }       from '@ui/card';
import { IconButton } from '@ui/iconbutton';
import { Pic }         from '../pic/index.jsx';
import * as events     from '../../events.js';
import { useEventState } from '../../hooks.js';
import './index.css';

export function GameCard({ server, isFav, onToggleFav, style }) {
  const [bad, setBad] = useState(false);
  const connection = useEventState('mainmenu:connection', events.get_connection);
  const here = connection.state !== 'idle' && connection.port === server.port && (connection.ip === server.ip || (server.local && events.is_loopback(connection.ip)));
  const busy = here && connection.state === 'connecting';
  const players = here && !busy ? Math.max(1, server.players) : server.players; // we are inside, so at least one
  const action = here ? { icon: <Unplug size={11} strokeWidth={2.4}/>, label: busy ? 'Connecting…' : 'Leave' }
               : server.full ? { icon: <Ban size={11} strokeWidth={2.4}/>, label: 'Full' }
               : { icon: <Play size={10} strokeWidth={2.4} fill="currentColor"/>, label: server.local ? 'Connect' : 'Play' };
  useEffect(() => setBad(false), [server.banner]);

  return (
    <Card
      className={`gcard${server.local ? ' gcard--local' : ''}${here ? ' is-connected' : ''}`}
      style={style}
      cover={bad ? undefined : server.banner ?? undefined}
      onCoverError={() => setBad(true)}
      coverPlaceholder={<div className="gc-art" />}
      topRight={server.local ? (
        <Badge className="gc-badge"><Server size={11} strokeWidth={2.2}/>{here ? (busy ? 'Connecting' : 'Connected') : 'Localserver'}</Badge>
      ) : (
        <IconButton
          className={`gc-btn gc-fav${isFav ? ' on' : ''}`}
          icon={Star}
          iconProps={{ size: 13, strokeWidth: 1.6 }}
          title="Favourite"
          onClick={() => onToggleFav(server.id)}
        />
      )}
      title={
        <span className="gc-title-stack">
          <Pic src={server.logo} className="gc-logo">{server.name.charAt(0).toUpperCase()}</Pic>
          <span className="gc-title-text">{server.name}</span>
        </span>
      }
      description={server.desc ? <span className="gc-desc-text">{server.desc}</span> : undefined}
      footer={
        <>
          <span className="gc-stat">
            <strong>{players}</strong>{server.max ? `/${server.max}` : ''}
          </span>
          <div className="gc-links">
            {server.discord && (
              <IconButton
                className="gc-btn"
                icon={MessageCircle}
                iconProps={{ size: 12, strokeWidth: 1.6 }}
                title="Discord"
                onClick={() => events.open_url(server.discord)}
              />
            )}
            {server.site && (
              <IconButton
                className="gc-btn"
                icon={Globe}
                iconProps={{ size: 12, strokeWidth: 1.6 }}
                title="Site"
                onClick={() => events.open_url(server.site)}
              />
            )}
            <Button
              variant="action"
              className="gjoin"
              danger={here}
              disabled={here ? busy : server.full}
              onClick={() => here ? events.disconnect() : events.connect(server.ip, server.port, server.http_port)}
            >
              {action.icon}{action.label}
            </Button>
          </div>
        </>
      }
    />
  );
}
