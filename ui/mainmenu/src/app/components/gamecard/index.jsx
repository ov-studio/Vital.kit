import * as react                from 'react';
import * as lucide               from 'lucide-react';
import * as shared_ui_badge      from '@ui/badge';
import * as shared_ui_button     from '@ui/button';
import * as shared_ui_card       from '@ui/card';
import * as shared_ui_iconbutton from '@ui/iconbutton';
import * as app_pic              from '../pic/index.jsx';
import * as app_data             from '../../data/index.jsx';
import * as app_events           from '../../events.js';
import * as app_hooks            from '../../hooks.js';
import './index.css';

export function GameCard({ server, isFav, onToggleFav, style }) {
  const [bad, setBad] = react.useState(false);
  const connection = app_hooks.useEventState('mainmenu:connection', app_events.get_connection);
  const here = app_data.is_connected_to(connection, server);
  const busy = here && connection.state === 'connecting';
  const players = here && !busy ? Math.max(1, server.players) : server.players;
  const action = here ? { icon: <lucide.Unplug size={11} strokeWidth={2.4}/>, label: busy ? 'Connecting…' : 'Leave' }
               : server.full ? { icon: <lucide.Ban size={11} strokeWidth={2.4}/>, label: 'Full' }
               : { icon: <lucide.Play size={10} strokeWidth={2.4} fill="currentColor"/>, label: server.local ? 'Connect' : 'Play' };
  react.useEffect(() => setBad(false), [server.banner]);

  return (
    <shared_ui_card.Card
      className={`gcard${server.local ? ' gcard--local' : ''}${here ? ' is-connected' : ''}${busy ? ' is-busy' : ''}`}
      style={style}
      cover={bad ? undefined : server.banner ?? undefined}
      onCoverError={() => setBad(true)}
      coverPlaceholder={<div className="gc-art" />}
      topRight={server.local ? (
        <shared_ui_badge.Badge className="gc-badge"><lucide.Server size={11} strokeWidth={2.2}/>{here ? (busy ? 'Connecting' : 'Connected') : 'Localserver'}</shared_ui_badge.Badge>
      ) : (
        <shared_ui_iconbutton.IconButton
          className={`gc-btn gc-fav${isFav ? ' on' : ''}`}
          icon={lucide.Star}
          iconProps={{ size: 13, strokeWidth: 1.6 }}
          title="Favourite"
          onClick={() => onToggleFav(server.id)}
        />
      )}
      title={
        <span className="gc-title-stack">
          <app_pic.Pic src={server.logo} className="gc-logo">{server.name.charAt(0).toUpperCase()}</app_pic.Pic>
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
            <span className="gc-social">
              {server.discord && (
                <shared_ui_iconbutton.IconButton
                  className="gc-btn"
                  icon={lucide.MessageCircle}
                  iconProps={{ size: 12, strokeWidth: 1.6 }}
                  title="Discord"
                  onClick={() => app_events.open_url(server.discord)}
                />
              )}
              {server.site && (
                <shared_ui_iconbutton.IconButton
                  className="gc-btn"
                  icon={lucide.Globe}
                  iconProps={{ size: 12, strokeWidth: 1.6 }}
                  title="Site"
                  onClick={() => app_events.open_url(server.site)}
                />
              )}
            </span>
            <shared_ui_button.Button
              variant="action"
              className="gjoin"
              danger={here}
              disabled={here ? busy : server.full}
              onClick={() => here ? app_events.disconnect() : app_events.connect(server.ip, server.port, server.http_port)}
            >
              {action.icon}{action.label}
            </shared_ui_button.Button>
          </div>
        </>
      }
    />
  );
}
