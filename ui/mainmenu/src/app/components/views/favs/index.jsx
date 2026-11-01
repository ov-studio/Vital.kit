import * as lucide       from 'lucide-react';
import * as app_empty    from '../../empty/index.jsx';
import * as app_data     from '../../../data/index.jsx';
import * as app_cardgrid from '../../cardgrid/index.jsx';

export function ViewFavs({ favs, onToggleFav }) {
  const { servers } = app_data.useMasterlist();
  const favServers = servers.filter(s => favs.has(s.id));

  return (
    <div className="view">
      <section className="app-section">
        {favServers.length === 0 ? (
          <app_empty.Empty icon={lucide.Star} className="app-empty--fill">
            No favourites yet. Click the star icon on any game card to save it here. Favourites that are offline won't show until they're back.
          </app_empty.Empty>
        ) : (
          <app_cardgrid.CardGrid servers={favServers} favs={favs} onToggleFav={onToggleFav}/>
        )}
      </section>
    </div>
  );
}
