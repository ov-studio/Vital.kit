import { Star } from 'lucide-react';
import { EmptyState } from '@ui/empty';
import { SERVERS }    from '../../../data/index.jsx';
import { CardGrid }   from '../../cardgrid/index.jsx';

export function ViewFavs({ favs, onToggleFav }) {
  const favServers = SERVERS.filter(s => favs.has(s.name));

  return (
    <div className="view">
      {favServers.length === 0 ? (
        <EmptyState icon={<Star size={24} strokeWidth={2.5} />}>
          No favourites yet. Click the star icon on any game card to save it here.
        </EmptyState>
      ) : (
        <CardGrid servers={favServers} favs={favs} onToggleFav={onToggleFav} />
      )}
    </div>
  );
}
