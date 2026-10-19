import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@ui/button';
import { TagPill } from '@ui/tagpill';
import { Pic } from '../pic/index.jsx';
import * as events from '../../events.js';
import './index.css';

const INTERVAL = 5000; // ms between featured servers

/* Hero banner cycling through the busiest live servers (max 3) + side list.
   Timers pause while `visible` is false so the progress dot stays in sync. */
export function Featured({ visible, servers }) {
  const [idx, setIdx] = useState(0);
  const current = servers.length ? Math.min(idx, servers.length - 1) : 0;
  const active = servers[current];

  useEffect(() => {
    if (!visible || servers.length < 2) return;
    const cycle = setTimeout(() => setIdx((current + 1) % servers.length), INTERVAL);
    return () => clearTimeout(cycle);
  }, [visible, current, servers.length]);

  if (!active) return null;

  return (
    <div className="hero-row">
      <div className="hero">
        {servers.map((f, i) => (
          <Pic key={f.id} src={f.banner} className={`hero-img${i === current ? ' on' : ''}`} />
        ))}
        <div className="hero-content" key={active.id}>
          {active.tags[0] && <TagPill label={active.tags[0]} />}
          <div className="hero-title">{active.name}</div>
          {active.desc && <p className="hero-desc">{active.desc}</p>}
          <div className="hero-meta">
            <Button
              className="hero-join"
              disabled={active.full}
              onClick={() => events.connect(active.ip, active.port, active.http_port)}
            >
              {active.full ? 'Full' : <><Play size={11} fill="currentColor" />Play Now</>}
            </Button>
            <span className="hero-viewers">
              <strong>{active.players}</strong>{active.max ? ` / ${active.max}` : ''} online
            </span>
          </div>
        </div>
        {servers.length > 1 && (
          <div className="hero-dots" style={{ '--cycle': `${INTERVAL}ms` }}>
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
            <Pic src={f.logo} className="feat-thumb">{f.name.charAt(0).toUpperCase()}</Pic>
            <span className="feat-info">
              <span className="feat-name">{f.name}</span>
              <span className="feat-meta">
                <strong>{f.players}</strong>{f.max ? ` / ${f.max}` : ''} players
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
