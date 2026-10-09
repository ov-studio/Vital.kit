import { Star, Globe, Play } from 'lucide-react';
import { Button }     from '@ui/button';
import { Card }       from '@ui/card';
import { IconButton } from '@ui/iconbutton';
import { DiscordIcon } from '../icons/index.jsx';
import { Pic }         from '../pic/index.jsx';
import * as events     from '../../events.js';
import { useState, useEffect } from 'react';
import './index.css';

export function GameCard({ server, isFav, onToggleFav, style }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [server.banner]);
  return (
    <Card
      className="gcard"
      style={style}
      cover={bad ? undefined : server.banner ?? undefined}
      onCoverError={() => setBad(true)}
      coverPlaceholder={<div className="gc-art" />}
      topLeft={<Pic src={server.logo} className="gc-logo">{server.name.charAt(0).toUpperCase()}</Pic>}
      topRight={
        <IconButton
          className={`gc-btn gc-fav${isFav ? ' on' : ''}`}
          icon={Star}
          iconProps={{ size: 13, strokeWidth: 1.6 }}
          title="Favourite"
          onClick={() => onToggleFav(server.id)}
        />
      }
      title={server.name}
      description={server.desc || undefined}
      footer={
        <>
          <span className="gc-stat">
            <strong>{server.players}</strong>{server.max ? `/${server.max}` : ''}
          </span>
          <div className="gc-links">
            {server.discord && <IconButton className="gc-btn" icon={DiscordIcon} iconProps={{ size: 12 }} title="Discord" onClick={() => events.open_url(server.discord)} />}
            {server.site && <IconButton className="gc-btn" icon={Globe} iconProps={{ size: 12, strokeWidth: 1.6 }} title="Site" onClick={() => events.open_url(server.site)} />}
            <Button variant="action" className="gjoin" disabled={server.full} onClick={() => events.connect(server.ip, server.port, server.http_port)}>
              {server.full ? 'Full' : <><Play size={9} fill="currentColor" />Play</>}
            </Button>
          </div>
        </>
      }
    />
  );
}
