import { useMemo, useRef } from 'react';
import { Star, Flame } from 'lucide-react';
import { SERVERS } from '../../../data/index.jsx';
import { LocalServer } from '../../localserver/index.jsx';
import { Featured } from '../../featured/index.jsx';
import { CardGrid, useFitCount } from '../../cardgrid/index.jsx';

export function ViewPlay({ visible, favs, onToggleFav }) {
  const trending = useMemo(() => [...SERVERS].sort((a, b) => b.players - a.players), []);
  const gridRef = useRef(null);
  const fitCount = useFitCount(gridRef);

  return (
    <div className="view">
      <LocalServer active={visible} />
      <div className="slabel"><Star size={11} fill="currentColor" />Featured</div>
      <Featured visible={visible} />

      <div className="slabel"><Flame size={11} fill="currentColor" />Trending</div>
      <CardGrid
        fit
        gridRef={gridRef}
        servers={fitCount == null ? trending : trending.slice(0, fitCount)}
        favs={favs}
        onToggleFav={onToggleFav}
      />
    </div>
  );
}
