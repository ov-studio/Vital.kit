import { Star, Globe, Play } from 'lucide-react';
import { Button }     from '@ui/button';
import { Card }       from '@ui/card';
import { IconButton } from '@ui/iconbutton';
import { DiscordIcon } from '../icons/index.jsx';
import { hue }         from '../../data/index.jsx';
import * as events     from '../../events.js';
import './index.css';

export function GameCard({ server, isFav, onToggleFav, style }) {
  return (
    <Card
      className="gcard"
      style={style}
      coverPlaceholder={<div className="gc-art" style={{ '--hue': hue(server.name) }} />}
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
