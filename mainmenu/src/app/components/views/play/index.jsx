import { useRef } from 'react';
import { SearchIcon, Star, Flame } from 'lucide-react';
import { Divider }    from '@ui/divider';
import { EmptyState } from '@ui/empty';
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
      <LocalServer active={visible} />
      {servers.length === 0 ? (
        <EmptyState icon={<SearchIcon size={24} strokeWidth={2.5} />}>{emptyText(status, false)}</EmptyState>
      ) : (
        <>
          <div className="slabel"><Star size={11} fill="currentColor" />Featured</div>
          <Divider className="play-label-divider" />
          <Featured visible={visible} servers={servers.slice(0, 3)} />

          <div className="slabel play-trending-label"><Flame size={11} fill="currentColor" />Trending</div>
          <Divider className="play-label-divider" />
          <CardGrid
            fit
            gridRef={gridRef}
            servers={fitCount == null ? servers : servers.slice(0, fitCount)}
            favs={favs}
            onToggleFav={onToggleFav}
          />
        </>
      )}
    </div>
  );
}
