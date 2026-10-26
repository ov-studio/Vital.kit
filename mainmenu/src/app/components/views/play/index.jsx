import { useRef } from 'react';
import { SearchIcon } from 'lucide-react';
import { Badge }      from '@ui/badge';
import { EmptyState } from '@ui/empty';
import { Wallpaper }  from '@ui/wallpaper';
import { useMasterlist, emptyText } from '../../../data/index.jsx';
import { LocalServer } from '../../localserver/index.jsx';
import { Featured } from '../../featured/index.jsx';
import { CardGrid, useFitCount } from '../../cardgrid/index.jsx';
import './index.css';

export function ViewPlay({ visible, favs, onToggleFav }) {
  const { status, servers } = useMasterlist(); // already sorted by players, busiest first
  const gridRef = useRef(null);
  const fitCount = useFitCount(gridRef);

  return (
    <div className="view view-play">
      <Wallpaper variant={2} opacity={0.45} vignette={false} />
      <LocalServer active={visible} />
      {servers.length === 0 ? (
        <EmptyState icon={<SearchIcon size={24} strokeWidth={2.5} />}>{emptyText(status, false)}</EmptyState>
      ) : (
        <>
          <section className="play-section">
            <Badge className="play-badge">Featured</Badge>
            <Featured visible={visible} servers={servers.slice(0, 3)} />
          </section>

          <section className="play-section play-section--grow">
            <Badge className="play-badge">Trending</Badge>
            <CardGrid
              fit
              gridRef={gridRef}
              servers={fitCount == null ? servers : servers.slice(0, fitCount)}
              favs={favs}
              onToggleFav={onToggleFav}
            />
          </section>
        </>
      )}
    </div>
  );
}
