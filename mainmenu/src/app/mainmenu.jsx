import { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid, Star, Flame, Settings, Play, UsersRound, ExternalLink,
  Download, X
} from 'lucide-react';
import { SERVERS, FEATURED, HERO, BANNERS, LOGOS, shuffle } from './data.jsx';

/* ─────────────────────── tiny helpers ─────────────────────── */
const pct  = (p, m) => Math.round(p / m * 100);
const bar  = (p, m) => { const v = pct(p,m); return v >= 100 ? 'hi' : v >= 65 ? 'md' : 'lo'; };

/* ─────────────────────── Brand logo ────────────────────────── */
function BrandLogo() {
  return (
    <div className="hud-logo">
      <div className="brand brand--xs brand--logo-only">
        <div className="brand_logo-wrapper">
          <div className="brand_logo" />
        </div>
      </div>
    </div>
  );
}

/* ────────────────────── External link icon ─────────────────── */
function ExtIco() {
  return (
    <svg className="ext-ico" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M5 2.5H2.5a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V7M8.5 1.5h2m0 0v2m0-2L5.5 6.5"/>
    </svg>
  );
}

/* ────────────────────── Discord SVG ────────────────────────── */
function DiscordSvg({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor">
      <path d="M10.2 1.9A9.4 9.4 0 007.7 1.2a6.6 6.6 0 00-.3.6 8.7 8.7 0 00-2.8 0 6.2 6.2 0 00-.3-.6A9.4 9.4 0 001.8 1.9C.6 3.9.2 5.7.3 7.4a9.7 9.7 0 002.9 1.5 7 7 0 00.6-1 6.2 6.2 0 01-1-.5l.2-.2a7 7 0 006 0l.2.2a6.2 6.2 0 01-.9.4 7 7 0 00.6 1 9.7 9.7 0 002.9-1.5c.1-2.1-.4-3.9-1.6-5.4zM4.1 6.2c-.6 0-1-.5-1-1.2s.4-1.2 1-1.2 1 .5 1 1.2-.4 1.2-1 1.2zm3.8 0c-.6 0-1-.5-1-1.2s.4-1.2 1-1.2 1 .5 1 1.2-.4 1.2-1 1.2z"/>
    </svg>
  );
}

/* ─────────────────────── Game Card ─────────────────────────── */
function GameCard({ server, banner, logo, isFav, onToggleFav, style }) {
  const p    = server.players;
  const m    = server.max;
  const barC = bar(p, m);
  const abbr = server.name.split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <div className="gcard" style={style}>
      <div className="gc-cover">
        <img src={banner} alt={server.name} onError={e => e.target.style.opacity = '0'} />
      </div>
      <div className="gc-scrim" />

      <div className="gc-top">
        <div className="gc-top-left">

        </div>
        <button
          className={`gc-fav${isFav ? ' on' : ''}`}
          onClick={e => { e.stopPropagation(); onToggleFav(server.name); }}
          title="Favourite"
        >
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M7 2l1.6 3.3 3.6.5-2.6 2.6.6 3.6L7 10.4l-3.2 1.6.6-3.6L1.8 5.8l3.6-.5z"/>
          </svg>
        </button>
      </div>

      <div className="gc-body">
        <div className="gc-name">{server.name}</div>
        <div className="gc-desc">{server.desc}</div>
        <div className="gc-foot">
          <div className="gc-stat">
            <UsersRound size={11} fill="currentColor" />
            <strong>{p}</strong>/{m}
          </div>
          <div className="gc-links">
            {server.discord && (
              <a className="glink" href="#" onClick={e => e.preventDefault()} title="Discord">
                <DiscordSvg />
              </a>
            )}
            {server.site && (
              <a className="glink" href="#" onClick={e => e.preventDefault()} title="Site">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <circle cx="6" cy="6" r="4.5"/>
                  <path d="M6 1.5c-1.7 1.3-2.2 2.8-2.2 4.5S4.3 9.2 6 10.5M6 1.5c1.7 1.3 2.2 2.8 2.2 4.5S7.7 9.2 6 10.5M1.5 6h9"/>
                </svg>
              </a>
            )}
            {server.status === 'full'
              ? <button className="gjoin off" disabled>Full</button>
              : (
                <button className="gjoin">
                  <Play size={9} fill="currentColor" />
                  Play
                </button>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Settings toggle ───────────────────── */
function Toggle({ defaultOn = true }) {
  const [on, setOn] = useState(defaultOn);
  return <button className={`toggle${on ? ' on' : ''}`} onClick={() => setOn(v => !v)} />;
}

/* ─────────────────────── View: Play ────────────────────────── */
function ViewPlay({ favs, onToggleFav }) {
  const bannerList = useRef(shuffle(Array.from({ length: SERVERS.length }, (_, i) => BANNERS[i % BANNERS.length]))).current;
  const logoList   = useRef(shuffle(Array.from({ length: SERVERS.length }, (_, i) => LOGOS[i % LOGOS.length]))).current;

  const [heroPlayers, setHeroPlayers] = useState(HERO.players);

  useEffect(() => {
    const t = setInterval(() => setHeroPlayers(v => Math.max(1, Math.min(HERO.max, v + Math.floor(Math.random() * 6) - 3))), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="view active" id="view-play">
      {/* HERO */}

      <div className="slabel"><Star size={11} fill="currentColor"/>Featured</div>
      <div className="hero-row">
        <div className="hero-banner">
          <img src={HERO.img} alt={HERO.name} onError={e => e.target.style.opacity = '0'} />
          <div className="hero-content">
            <div className="hero-badge">
              <Star size={10} fill="currentColor" />
              Featured
            </div>
            <div className="hero-title">{HERO.name}</div>
            <div className="hero-desc">{HERO.desc}</div>
            <div className="hero-meta">
              <button className="hero-join">
                <Play size={11} fill="currentColor" />
                Join Server
              </button>
              <div className="hero-viewers">
                <UsersRound size={12} fill="currentColor" />
                <strong>{heroPlayers}</strong>&nbsp;/ {HERO.max} online
              </div>
            </div>
          </div>
        </div>

        <div className="featured-list">
          {FEATURED.map(f => (
            <div className="feat-item" key={f.name}>
              <div className="feat-thumb">
                <img src={f.img} alt={f.name} onError={e => e.target.style.opacity = '0'} />
              </div>
              <div className="feat-info">
                <div className="feat-name">{f.name}</div>
                <div className="feat-meta"><strong>{f.players}</strong> / {f.max} players</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="slabel slabel-trending"><Flame size={11} fill="currentColor" />Trending</div>

      <div className="cgrid-wrap">
        <div className="cgrid">
          {SERVERS.map((s, i) => (
            <GameCard
              key={s.name}
              server={s}
              banner={bannerList[i]}
              logo={logoList[i]}
              isFav={favs.has(s.name)}
              onToggleFav={onToggleFav}
              style={{ animationDelay: `${0.04 + i * 0.04}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── View: Favourites ──────────────────── */
function ViewFavs({ favs, onToggleFav }) {
  const bannerList = useRef(shuffle(Array.from({ length: SERVERS.length }, (_, i) => BANNERS[i % BANNERS.length]))).current;
  const logoList   = useRef(shuffle(Array.from({ length: SERVERS.length }, (_, i) => LOGOS[i % LOGOS.length]))).current;

  const favServers = SERVERS.filter(s => favs.has(s.name));

  return (
    <div className="view active" id="view-favs">
      <div className="view-head">
        <div className="slabel">Your Library</div>
        <div className="view-title-row"><span className="view-title">Favourites</span></div>
      </div>
      {favServers.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M24 6l5.6 11.4 12.4 1.8-9 8.8 2.1 12.4L24 34.6l-11.1 5.8 2.1-12.4-9-8.8 12.4-1.8z"/>
          </svg>
          <h3>No Favourites Yet</h3>
          <p>Click the star icon on any game card to save it here.</p>
        </div>
      ) : (
        <div className="cgrid-wrap">
          <div className="cgrid">
            {favServers.map((s, i) => (
              <GameCard
                key={s.name}
                server={s}
                banner={bannerList[SERVERS.indexOf(s)]}
                logo={logoList[SERVERS.indexOf(s)]}
                isFav={true}
                onToggleFav={onToggleFav}
                style={{ animationDelay: `${0.04 + i * 0.04}s` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── View: Settings ───────────────────── */
function ViewSettings() {
  const [name, setName] = useState('FallingStickman');

  return (
    <div className="view active" id="view-settings">
      <div className="view-head">
        <div className="slabel">Preferences</div>
        <div className="view-title-row"><span className="view-title">Settings</span></div>
      </div>
      <div className="view-body">
        <div className="settings-section">
          <div className="settings-label">Display</div>
          <div className="setting-row">
            <div><div className="setting-name">Animate Card Hover</div><div className="setting-desc">Enable lift and scale when hovering cards</div></div>
            <Toggle defaultOn={true} />
          </div>
          <div className="setting-row">
            <div><div className="setting-name">Live Player Count</div><div className="setting-desc">Auto-refresh player numbers every 5 seconds</div></div>
            <Toggle defaultOn={true} />
          </div>
          <div className="setting-row">
            <div><div className="setting-name">Show Player Bar</div><div className="setting-desc">Display fill bar indicating server capacity</div></div>
            <Toggle defaultOn={true} />
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-label">Account</div>
          <div className="setting-row">
            <div><div className="setting-name">Display Name</div><div className="setting-desc">Your visible name across the lobby</div></div>
            <input className="form-input" style={{ width: 180 }} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="setting-row">
            <div><div className="setting-name">Default Genre Filter</div><div className="setting-desc">Which tab opens by default on Browse Games</div></div>
            <select className="setting-select">
              <option>All</option>
              <option>Roleplay</option>
              <option>Racing</option>
              <option>Shooter</option>
              <option>Sandbox</option>
              <option>Survival</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-label">About</div>
          <div className="setting-row">
            <div>
              <div className="setting-name">Vital.sandbox</div>
              <div className="setting-desc">Launcher v2.4.1 — Build b3095-beta · Lua 5.4 · Godot/C++17</div>
            </div>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '.64rem', color: 'var(--dark)' }}>Open Source</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Main menu root ────────────────────── */
export function MainMenu() {
  const [activeView, setActiveView] = useState('play');
  const [favs, setFavs]             = useState(new Set());

  const toggleFav = name => {
    setFavs(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  // TODO: wire this up to actually exit the game
  const handleExit = () => {};

  const views = {
    play:     <ViewPlay     favs={favs}    onToggleFav={toggleFav} />,
    favs:     <ViewFavs     favs={favs}    onToggleFav={toggleFav} />,
    settings: <ViewSettings />,
  };

  const navItems = [
    { id: 'play',     icon: <LayoutGrid size={19} className="nav-btn-ico" />, title: 'Browse' },
    { id: 'favs',     icon: <Star       size={19} className="nav-btn-ico" />, title: 'Favourites' },
    { id: 'settings', icon: <Settings   size={19} className="nav-btn-ico" />, title: 'Settings' },
  ];

  return (
    <>
      <div className="vignette" />

      {/* SIDEBAR */}
      <aside className="sidebar">
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-btn${activeView === item.id ? ' on' : ''}`}
              title={item.title}
              onClick={() => setActiveView(item.id)}
            >
              {item.icon}
            </button>
          ))}
        </nav>
      </aside>

      {/* TOP HUD */}
      <header className="hud-top">
        <BrandLogo />
        <div className="hud-greet">Greetings, <strong>FallingStickman</strong></div>
        <div className="hud-right">
          <nav className="hud-nav-links">
            <a className="hud-nav-link" href="#" onClick={e => e.preventDefault()} title="Documentation">
              Documentations <ExtIco />
            </a>
            <a className="hud-nav-link" href="#" onClick={e => e.preventDefault()} title="Support">
              Discord <ExtIco />
            </a>
            <a className="hud-nav-link" href="#" onClick={e => e.preventDefault()} title="Donate">
              Donate <ExtIco />
            </a>
          </nav>
          <button className="hud-icon-btn" title="Downloads">
            <Download size={15} />
          </button>
          <button className="hud-icon-btn" title="Exit Game" onClick={handleExit}>
            <X size={15} />
          </button>
        </div>
      </header>

      {/* CENTER CONTENT */}
      <div className="center-panel">
        {Object.entries(views).map(([id, el]) => (
          <div
            key={id}
            style={{ display: activeView === id ? 'contents' : 'none' }}
          >
            {el}
          </div>
        ))}
      </div>
    </>
  );
}
