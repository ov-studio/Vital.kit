import { Star, UsersRound, Globe, Play } from 'lucide-react';
import { Button }     from '@ui/button';
import { Card }       from '@ui/card';
import { IconButton } from '@ui/iconbutton';
import { TagPill }    from '@ui/tagpill';
import { DiscordIcon } from '../icons/index.jsx';
import { hideBroken }  from '../utils/index.js';
import './index.css';

export function GameCard({ server, isFav, onToggleFav, showTag, style }) {
  return (
    <Card
      className="gcard"
      style={style}
      cover={server.banner}
      coverAlt={server.name}
      onCoverError={hideBroken}
      topLeft={showTag && <TagPill label={server.genre} />}
      topRight={
        <IconButton
          className={`gc-btn gc-fav${isFav ? ' on' : ''}`}
          icon={Star}
          iconProps={{ size: 13, strokeWidth: 1.6 }}
          title="Favourite"
          onClick={() => onToggleFav(server.name)}
        />
      }
      title={server.name}
      description={server.desc}
      footer={
        <>
          <span className="gc-stat">
            <UsersRound size={11} fill="currentColor" />
            <strong>{server.players}</strong>/{server.max}
          </span>
          <div className="gc-links">
            {server.discord && <IconButton className="gc-btn" icon={DiscordIcon} iconProps={{ size: 12 }} title="Discord" />}
            {server.site && <IconButton className="gc-btn" icon={Globe} iconProps={{ size: 12, strokeWidth: 1.6 }} title="Site" />}
            <Button variant="action" className="gjoin" disabled={server.status === 'full'}>
              {server.status === 'full' ? 'Full' : <><Play size={9} fill="currentColor" />Play</>}
            </Button>
          </div>
        </>
      }
    />
  );
}
