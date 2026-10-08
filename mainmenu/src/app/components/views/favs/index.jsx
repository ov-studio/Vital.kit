import { Star } from 'lucide-react';
import { EmptyState } from '@ui/empty';
import { useMasterlist } from '../../../data/index.jsx';
import { CardGrid }   from '../../cardgrid/index.jsx';

export function ViewFavs({ favs, onToggleFav }) {
  const { servers } = useMasterlist();
  const favServers = servers.filter(s => favs.has(s.id));

  return (
    <div className="view">
      {favServers.length === 0 ? (
        <EmptyState icon={<Star size={24} strokeWidth={2.5} />}>
          No favourites yet. Click the star icon on any game card to save it here. Favourites that are offline won't show until they're back.
        </EmptyState>
      ) : (
        <CardGrid servers={favServers} favs={favs} onToggleFav={onToggleFav} />
      )}
    </div>
  );
}
