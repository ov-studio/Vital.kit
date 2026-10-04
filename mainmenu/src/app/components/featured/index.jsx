import { useState, useEffect } from 'react';
import { Play, UsersRound } from 'lucide-react';
import { Button }  from '@ui/button';
import { TagPill } from '@ui/tagpill';
import { FEATURED } from '../../data/index.jsx';
import { hideBroken } from '../../utils/index.js';
import './index.css';

const INTERVAL = 5000; // ms between featured servers

/* Hero banner cycling through FEATURED, plus the clickable list beside it.
   Timers pause while `visible` is false, which also keeps the progress dot in sync. */
export function Featured({ visible }) {
  // Index and live player count change together, so the count never lags a switch.
  const [hero, setHero] = useState({ idx: 0, players: FEATURED[0].players });
  const active = FEATURED[hero.idx];

  const go = idx => setHero({ idx, players: FEATURED[idx].players });

  // Any change of idx (auto-cycle or click) restarts both timers.
  useEffect(() => {
    if (!visible) return;
    const cycle = setTimeout(() => go((hero.idx + 1) % FEATURED.length), INTERVAL);
    const jitter = setInterval(() => {
      setHero(h => ({ ...h, players: Math.max(1, Math.min(active.max, h.players + Math.floor(Math.random() * 6) - 3)) }));
    }, 5000);
    return () => { clearTimeout(cycle); clearInterval(jitter); };
  }, [visible, hero.idx]);

  return (
    <div className="hero-row">
      <div className="hero">
        {FEATURED.map((f, i) => (
          <img key={f.name} className={`hero-img${i === hero.idx ? ' on' : ''}`} src={f.img} alt="" onError={hideBroken} />
        ))}
        <div className="hero-content" key={active.name}>
          <TagPill label={active.genre} />
          <div className="hero-title">{active.name}</div>
          <p className="hero-desc">{active.desc}</p>
          <div className="hero-meta">
            <Button className="hero-join">
              <Play size={11} fill="currentColor" />
              Join Server
            </Button>
            <span className="hero-viewers">
              <UsersRound size={12} fill="currentColor" />
              <strong>{hero.players}</strong>/ {active.max} online
            </span>
          </div>
        </div>
        <div className="hero-dots" style={{ '--cycle': `${INTERVAL}ms` }}>
          {FEATURED.map((f, i) => (
            <button
              key={f.name}
              className={`hero-dot${i === hero.idx ? ' on' : ''}`}
              onClick={() => go(i)}
              aria-label={`Show ${f.name}`}
            />
          ))}
        </div>
      </div>

      <div className="featured-list">
        {FEATURED.map((f, i) => (
          <button key={f.name} className={`feat-item${i === hero.idx ? ' on' : ''}`} onClick={() => go(i)}>
            <img className="feat-thumb" src={f.logo} alt="" onError={hideBroken} />
            <span className="feat-info">
              <span className="feat-name">{f.name}</span>
              <span className="feat-meta"><strong>{i === hero.idx ? hero.players : f.players}</strong> / {f.max} players</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
