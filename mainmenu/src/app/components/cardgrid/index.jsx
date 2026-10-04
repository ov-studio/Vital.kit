import { useState, useLayoutEffect } from 'react';
import { GameCard } from '../gamecard/index.jsx';
import './index.css';

/* Card grid geometry. The CSS reads it back through custom properties (see
   GRID_VARS), so useFitCount and the stylesheet can never drift apart. */
const CARD = { minWidth: 210, gap: 14, ratio: 3 / 4 };
const GRID_VARS = {
  '--card-min':   `${CARD.minWidth}px`,
  '--card-gap':   `${CARD.gap}px`,
  '--card-ratio': CARD.ratio,
};

/* Fit-to-space: how many cards fit the element without a scroller (most cards win). */
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

/* Grid of game cards. `fit` sizes it to its container (pair with useFitCount);
   otherwise it scrolls. */
export function CardGrid({ servers, favs, onToggleFav, fit, gridRef }) {
  return (
    <div className={`cgrid-wrap${fit ? ' cgrid-wrap--fit' : ''}`} ref={gridRef}>
      <div className="cgrid" style={GRID_VARS}>
        {servers.map((s, i) => (
          <GameCard
            key={s.name}
            server={s}
            isFav={favs.has(s.name)}
            onToggleFav={onToggleFav}
            style={{ animationDelay: `${0.04 + i * 0.04}s` }}
          />
        ))}
      </div>
    </div>
  );
}
