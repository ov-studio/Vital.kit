import * as react             from 'react';
import * as lucide            from 'lucide-react';
import * as shared_ui_badge   from '@ui/badge';
import * as app_empty         from '../../empty/index.jsx';
import * as app_data          from '../../../data/index.jsx';
import * as app_connectionbar from '../../connectionbar/index.jsx';
import * as app_news          from '../../news/index.jsx';
import * as app_featured      from '../../featured/index.jsx';
import * as app_cardgrid      from '../../cardgrid/index.jsx';
import * as app_config        from '../../../config.js';
import './index.css';

export function ViewPlay({ visible, favs, onToggleFav }) {
  const { status, servers } = app_data.useMasterlist();
  const gridRef = react.useRef(null);
  const fitCount = app_cardgrid.useFitCount(gridRef);
  const none = servers.length === 0;

  return (
    <div className="view view-play">
      <app_connectionbar.ConnectionBar/>

      <div className="play-top">
        <section className="play-section play-section--featured">
          <shared_ui_badge.Badge className="play-badge">Featured</shared_ui_badge.Badge>
          {none ? (
            <app_empty.Empty icon={lucide.Star} className="play-ghost-hero app-empty--boxed">
              {status === 'ok' ? 'Featured servers will appear here once someone is online.' : app_data.emptyText(status, false)}
            </app_empty.Empty>
          ) : (
            <app_featured.Featured visible={visible} servers={servers.slice(0, app_config.FEATURED_COUNT)}/>
          )}
        </section>

        <section className="play-section play-section--news">
          <shared_ui_badge.Badge className="play-badge">News</shared_ui_badge.Badge>
          <app_news.News active={visible}/>
        </section>
      </div>

      <section className="play-section play-section--grow">
        <shared_ui_badge.Badge className="play-badge">Trending</shared_ui_badge.Badge>
        <app_cardgrid.CardGrid
          fit
          gridRef={gridRef}
          servers={fitCount == null ? servers : servers.slice(0, fitCount)}
          favs={favs}
          onToggleFav={onToggleFav}
          empty={{ icon: lucide.TrendingUp, text: app_data.emptyText(status, false) }}
        />
      </section>
    </div>
  );
}
