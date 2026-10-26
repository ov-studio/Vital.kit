import { useState, useLayoutEffect } from 'react';
import { GameCard } from '../gamecard/index.jsx';
import { CARD } from '../../config.js';
import './index.css';

const GRID_VARS = {
  '--card-min':   `${CARD.minWidth}px`,
  '--card-gap':   `${CARD.gap}px`,
  '--card-ratio': CARD.ratio,
};

export function useFitCount(ref) {
  const [count, setCount] = useState(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const compute = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const cols = Math.max(1, Math.floor((w + CARD.gap) / (CARD.minWidth + CARD.gap)));
      const colWidth  = (w - (cols - 1) * CARD.gap) / cols;
      const rowHeight = colWidth / CARD.ratio;
      const rows = Math.max(1, Math.floor((h + CARD.gap) / (rowHeight + CARD.gap)));
      setCount(cols * rows);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return count;
}

export function CardGrid({ servers, favs, onToggleFav, fit, gridRef, empty = null }) {
  if (!servers.length && empty) {
    const Icon = empty.icon;
    return (
      <div className={`cgrid-wrap${fit ? ' cgrid-wrap--fit' : ''}`} ref={gridRef}>
        <div className="cgrid-empty">
          {Icon && <Icon size={22} strokeWidth={2} />}
          <span>{empty.text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`cgrid-wrap${fit ? ' cgrid-wrap--fit' : ''}`} ref={gridRef}>
      <div className="cgrid" style={GRID_VARS}>
        {servers.map((s, i) => (
          <GameCard
            key={s.id}
            server={s}
            isFav={favs.has(s.id)}
            onToggleFav={onToggleFav}
            style={{ animationDelay: `${0.04 + i * 0.04}s` }}
          />
        ))}
      </div>
    </div>
  );
}
