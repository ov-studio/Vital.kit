import * as react            from 'react';
import * as lucide           from 'lucide-react';
import * as shared_ui_button from '@ui/button';
import * as shared_ui_badge  from '@ui/badge';
import * as app_pic          from '../pic/index.jsx';
import * as app_events       from '../../events.js';
import * as app_config       from '../../config.js';
import './index.css';

export function Featured({ visible, servers }) {
  const [idx, setIdx] = react.useState(0);
  const current = servers.length ? Math.min(idx, servers.length - 1) : 0;
  const active = servers[current];

  react.useEffect(() => {
    if (!visible || servers.length < 2) return;
    const cycle = setTimeout(() => setIdx((current + 1) % servers.length), app_config.FEATURED_INTERVAL);
    return () => clearTimeout(cycle);
  }, [visible, current, servers.length]);

  if (!active) return null;

  return (
    <div className="hero-row">
      <div className="hero">
        {servers.map((f, i) => (
          <app_pic.Pic key={f.id} src={f.banner} className={`hero-img${i === current ? ' on' : ''}`}/>
        ))}
        <div className="hero-content" key={active.id}>
          {active.tags[0] && <shared_ui_badge.Badge className="hero-badge">{String(active.tags[0]).toUpperCase()}</shared_ui_badge.Badge>}
          <div className="hero-title">{active.name}</div>
          {active.desc && <p className="hero-desc">{active.desc}</p>}
          <div className="hero-meta">
            <shared_ui_button.Button
              className="hero-join"
              disabled={active.full}
              onClick={() => app_events.connect(active.ip, active.port, active.http_port)}
            >
              {active.full
                ? <><lucide.Ban size={14} strokeWidth={2.4}/>Server full</>
                : <><lucide.Play size={12} strokeWidth={2.4} fill="currentColor"/>Play Now</>}
            </shared_ui_button.Button>
            <span className="hero-viewers">
              <strong>{active.players}</strong>{active.max ? ` / ${active.max}` : ''} online
            </span>
          </div>
        </div>
        {servers.length > 1 && (
          <div className="hero-dots" style={{ '--cycle': `${app_config.FEATURED_INTERVAL}ms` }}>
            {servers.map((f, i) => (
              <button
                key={f.id}
                className={`hero-dot${i === current ? ' on' : ''}`}
                onClick={() => setIdx(i)}
                aria-label={`Show ${f.name}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="featured-list">
        {servers.map((f, i) => (
          <button key={f.id} className={`feat-item${i === current ? ' on' : ''}`} onClick={() => setIdx(i)}>
            <app_pic.Pic src={f.logo} className="feat-thumb">{f.name.charAt(0).toUpperCase()}</app_pic.Pic>
            <span className="feat-info">
              <span className="feat-name">{f.name}</span>
              <span className="feat-meta">
                <strong>{f.players}</strong>{f.max ? ` / ${f.max}` : ''} online
              </span>
            </span>
          </button>
        ))}
        {Array.from({ length: Math.max(0, app_config.FEATURED_COUNT - servers.length) }, (_, i) => (
          <div key={`open-${i}`} className="feat-item feat-item--open">
            <lucide.Star size={16} strokeWidth={2} />
            <span>Open featured slot</span>
          </div>
        ))}
      </div>
    </div>
  );
}
