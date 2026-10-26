import { useRef } from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { Badge } from '@ui/badge';
import { useMasterlist, emptyText } from '../../../data/index.jsx';
import { LocalServers } from '../../localserver/index.jsx';
import { News } from '../../news/index.jsx';
import { Featured } from '../../featured/index.jsx';
import { CardGrid, useFitCount } from '../../cardgrid/index.jsx';
import './index.css';

/* Play view: Featured + News on top, Local servers in the middle, Trending filling the rest.
   Every block keeps its container when empty and shows a placeholder instead. */
export function ViewPlay({ visible, favs, onToggleFav }) {
  const { status, servers } = useMasterlist(); // already sorted by players, busiest first
  const gridRef = useRef(null);
  const fitCount = useFitCount(gridRef);
  const none = servers.length === 0;

  return (
    <div className="view view-play">
      <div className="play-top">
        <section className="play-section play-section--featured">
          <Badge className="play-badge">Featured</Badge>
          {none ? (
            <div className="play-ghost-hero">
              <Star size={22} strokeWidth={2} />
              <span>{status === 'ok' ? 'Featured servers will appear here once someone is online.' : emptyText(status, false)}</span>
            </div>
          ) : (
            <Featured visible={visible} servers={servers.slice(0, 3)} />
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
          servers={none ? [] : fitCount == null ? servers : servers.slice(0, fitCount)}
          favs={favs}
          onToggleFav={onToggleFav}
          empty={{ icon: TrendingUp, text: emptyText(status, false) }}
        />
      </section>
    </div>
  );
}
