import { useRef } from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { Badge } from '@ui/badge';
import { Empty } from '../../empty/index.jsx';
import { useMasterlist, emptyText } from '../../../data/index.jsx';
import { ConnectionBar } from '../../connectionbar/index.jsx';
import { LocalServers } from '../../localserver/index.jsx';
import { News } from '../../news/index.jsx';
import { Featured } from '../../featured/index.jsx';
import { CardGrid, useFitCount } from '../../cardgrid/index.jsx';
import { FEATURED_COUNT } from '../../../config.js';
import './index.css';

export function ViewPlay({ visible, favs, onToggleFav }) {
  const { status, servers } = useMasterlist();
  const gridRef = useRef(null);
  const fitCount = useFitCount(gridRef);
  const none = servers.length === 0;

  return (
    <div className="view view-play">
      <ConnectionBar />

      <div className="play-top">
        <section className="play-section play-section--featured">
          <Badge className="play-badge">Featured</Badge>
          {none ? (
            <Empty icon={Star} className="play-ghost-hero app-empty--boxed">
              {status === 'ok' ? 'Featured servers will appear here once someone is online.' : emptyText(status, false)}
            </Empty>
          ) : (
            <Featured visible={visible} servers={servers.slice(0, FEATURED_COUNT)} />
          )}
        </section>

        <section className="play-section play-section--news">
          <Badge className="play-badge">News</Badge>
          <News active={visible} />
        </section>
      </div>

      <LocalServers active={visible} />

      <section className="play-section play-section--grow">
        <Badge className="play-badge">Trending</Badge>
        <CardGrid
          fit
          gridRef={gridRef}
          servers={fitCount == null ? servers : servers.slice(0, fitCount)}
          favs={favs}
          onToggleFav={onToggleFav}
          empty={{ icon: TrendingUp, text: emptyText(status, false) }}
        />
      </section>
    </div>
  );
}
