import * as app_empty    from '../empty/index.jsx';
import * as react        from 'react';
import * as app_gamecard from '../gamecard/index.jsx';
import * as app_config   from '../../config.js';
import './index.css';

const GRID_VARS = {
  '--card-min':   `${app_config.CARD.minWidth}px`,
  '--card-gap':   `${app_config.CARD.gap}px`,
  '--card-ratio': app_config.CARD.ratio,
};

export function useFitCount(ref) {
  const [count, setCount] = react.useState(null);

  react.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const compute = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const cols = Math.max(1, Math.floor((w + app_config.CARD.gap) / (app_config.CARD.minWidth + app_config.CARD.gap)));
      const colWidth  = (w - (cols - 1) * app_config.CARD.gap) / cols;
      const rowHeight = colWidth / app_config.CARD.ratio;
      const rows = Math.max(1, Math.floor((h + app_config.CARD.gap) / (rowHeight + app_config.CARD.gap)));
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
  const showEmpty = !servers.length && empty;

  return (
    <div className={`cgrid-wrap${fit ? ' cgrid-wrap--fit' : ''}`} ref={gridRef}>
      {showEmpty ? (
        <app_empty.Empty icon={empty.icon} className="app-empty--fill">{empty.text}</app_empty.Empty>
      ) : (
        <div className="cgrid" style={GRID_VARS}>
          {servers.map((s, i) => (
            <app_gamecard.GameCard
              key={s.id}
              server={s}
              isFav={favs.has(s.id)}
              onToggleFav={onToggleFav}
              style={{ animationDelay: `${0.04 + i * 0.04}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
