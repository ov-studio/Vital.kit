import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import {
  LayoutGrid, Star, Flame, Settings, Play, UsersRound, ExternalLink,
  Download, X, LayoutList, Search as SearchIcon
} from 'lucide-react';
import { SERVERS, FEATURED, BANNERS, LOGOS, shuffle } from './data.jsx';
import { IconButton } from './shared-ui/iconbutton/index.jsx';
import { TagPill }    from './shared-ui/tagpill/index.jsx';
import { Filter }     from './shared-ui/filter/index.jsx';
import { Search }     from './shared-ui/search/index.jsx';
import { Card }       from './shared-ui/card/index.jsx';

/* ─────────────────────── tiny helpers ─────────────────────── */
const pct  = (p, m) => Math.round(p / m * 100);
const bar  = (p, m) => { const v = pct(p,m); return v >= 100 ? 'hi' : v >= 65 ? 'md' : 'lo'; };

/* Genre/tag list derived from the server data, used by the Masterlist filters */
const ALL_GENRES = [...new Set(SERVERS.map(s => s.genre))];

/* ───────────── fit-to-space hook (no scroller, most cards win) ───────────── */
function useFitCount(ref, { minColWidth = 210, gap = 14, aspectRatio = 3 / 4 } = {}) {
  const [count, setCount] = useState(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const compute = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const cols = Math.max(1, Math.floor((w + gap) / (minColWidth + gap)));
      const colWidth  = (w - (cols - 1) * gap) / cols;
      const rowHeight = colWidth / aspectRatio;
      const rows = Math.max(1, Math.floor((h + gap) / (rowHeight + gap)));
      setCount(cols * rows);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, minColWidth, gap, aspectRatio]);

  return count;
}

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

/* ─────────────────────── Reusable: IconButton ───────────────── */
// Wraps any icon in a consistent square button. All pointer events are
// handled by the button element itself — children have pointer-events:none
// via CSS so every pixel of the hit area reliably fires onClick.
function GameCard({ server, banner, logo, isFav, onToggleFav, style, showTag }) {
  const p    = server.players;
  const m    = server.max;
  const barC = bar(p, m);
  const abbr = server.name.split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <Card
      className="gcard"
      style={style}
      cover={banner}
      coverAlt={server.name}
      onCoverError={e => e.target.style.opacity = '0'}
      coverClassName="gc-cover"
      scrimClassName="gc-scrim"
      topClassName="gc-top"
      topLeftClassName="gc-top-left"
      topLeft={showTag && <TagPill label={server.genre} className="gc-tag" />}
      topRight={
        <button
          className={`gc-fav${isFav ? ' on' : ''}`}
          onClick={e => { e.stopPropagation(); onToggleFav(server.name); }}
          title="Favourite"
        >
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M7 2l1.6 3.3 3.6.5-2.6 2.6.6 3.6L7 10.4l-3.2 1.6.6-3.6L1.8 5.8l3.6-.5z"/>
          </svg>
        </button>
      }
      bodyClassName="gc-body"
      title={server.name}
      titleClassName="gc-name"
      description={server.desc}
      descriptionClassName="gc-desc"
      footerClassName="gc-foot"
      footer={
        <>
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
        </>
      }
    />
  );
}

/* ─────────────────────── Settings toggle ───────────────────── */
function Toggle({ on: controlledOn, defaultOn = true, onChange }) {
  const [uncontrolledOn, setUncontrolledOn] = useState(defaultOn);
  const on = controlledOn !== undefined ? controlledOn : uncontrolledOn;
  const toggle = () => {
    const next = !on;
    if (controlledOn === undefined) setUncontrolledOn(next);
    onChange?.(next);
  };
  return <button className={`toggle${on ? ' on' : ''}`} onClick={toggle} />;
}

/* ─────────────────────── Custom dropdown ───────────────────── */
function CustomSelect({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div className={`cselect${open ? ' open' : ''}`} ref={ref}>
      <button className="cselect-trigger" onClick={() => setOpen(v => !v)}>
        <span>{selected.label}</span>
        <svg className="cselect-chevron" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 4.5L6 8l3.5-3.5"/>
        </svg>
      </button>
      {open && (
        <div className="cselect-menu">
          {options.map(o => (
            <button
              key={o.value}
              className={`cselect-option${o.value === value ? ' selected' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
              {o.value === value && (
                <svg className="cselect-check" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6l3 3 5-5"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Settings slider ───────────────────── */
function RangeSlider({ value, min = 1, max = 100, step = 1, onChange }) {
  const fillPct = ((value - min) / (max - min)) * 100;
  return (
    <div className="rslider">
      <input
        type="range"
        className="rslider-input"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--fill': `${fillPct}%` }}
        onChange={e => onChange?.(Number(e.target.value))}
      />
    </div>
  );
}

/* ─────────────────────── View: Play ────────────────────────── */
const FEATURED_INTERVAL = 5000; // ms between cycles

function ViewPlay({ favs, onToggleFav }) {
  const bannerList = useRef(shuffle(Array.from({ length: SERVERS.length }, (_, i) => BANNERS[i % BANNERS.length]))).current;
  const logoList   = useRef(shuffle(Array.from({ length: SERVERS.length }, (_, i) => LOGOS[i % LOGOS.length]))).current;

  const trendingSorted = useMemo(() => [...SERVERS].sort((a, b) => b.players - a.players), []);

  const trendingWrapRef = useRef(null);
  const fitCount = useFitCount(trendingWrapRef);
  const trendingVisible = fitCount == null ? trendingSorted : trendingSorted.slice(0, fitCount);

  // Featured cycling state — capped at 3 items
  const featuredItems = FEATURED.slice(0, 3);
  const [featIdx, setFeatIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(null);
  const [crossing, setCrossing] = useState(false);
  const [heroPlayers, setHeroPlayers] = useState(featuredItems[0].players);

  const crossTimer = useRef(null);

  const goTo = (next) => {
    if (next === featIdx) return;
    // Cancel any in-flight transition so rapid clicks always respond
    if (crossTimer.current) clearTimeout(crossTimer.current);
    setPrevIdx(featIdx);
    setFeatIdx(next);
    setHeroPlayers(featuredItems[next].players);
    setCrossing(true);
    crossTimer.current = setTimeout(() => {
      setCrossing(false);
      setPrevIdx(null);
    }, 500);
  };

  // Auto-cycle
  useEffect(() => {
    const timer = setInterval(() => {
      goTo((featIdx + 1) % featuredItems.length);
    }, FEATURED_INTERVAL);
    return () => clearInterval(timer);
  }, [featIdx, featuredItems.length]);

  // Jitter player count for the active featured server
  useEffect(() => {
    const t = setInterval(() => {
      const f = featuredItems[featIdx];
      setHeroPlayers(v => Math.max(1, Math.min(f.max, v + Math.floor(Math.random() * 6) - 3)));
    }, 5000);
    return () => clearInterval(t);
  }, [featIdx]);

  const activeFeat = featuredItems[featIdx];

  return (
    <div className="view active" id="view-play">
      {/* HERO */}
      <div className="slabel"><Star size={11} fill="currentColor"/>Featured</div>
      <div className="hero-row">
        <div className="hero-banner">
          {/* Outgoing image — stays at full opacity underneath while new one fades in */}
          {prevIdx !== null && (
            <img
              key={`prev-${prevIdx}`}
              className="hero-img hero-img--under"
              src={featuredItems[prevIdx].img}
              alt=""
              aria-hidden="true"
            />
          )}
          {/* Incoming / active image — fades in on top */}
          <img
            key={`active-${featIdx}`}
            className={`hero-img hero-img--top${crossing ? ' hero-img--crossing' : ''}`}
            src={activeFeat.img}
            alt={activeFeat.name}
            onError={e => e.target.style.opacity = '0'}
          />
          <div className="hero-content">
            <div className="hero-badge">
              <Star size={10} fill="currentColor" />
              Featured
            </div>
            <div className="hero-mid">
              <div className="hero-title">{activeFeat.name}</div>
              <div className="hero-desc">{activeFeat.desc}</div>
            </div>
            <div className="hero-meta">
              <button className="hero-join">
                <Play size={11} fill="currentColor" />
                Join Server
              </button>
              <div className="hero-viewers">
                <UsersRound size={12} fill="currentColor" />
                <strong>{heroPlayers}</strong>&nbsp;/ {activeFeat.max} online
              </div>
            </div>
          </div>
          {/* Cycle indicator dots */}
          <div className="hero-dots">
            {featuredItems.map((_, i) => (
              <button
                key={i}
                className={`hero-dot${i === featIdx ? ' active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Show ${featuredItems[i].name}`}
              />
            ))}
          </div>
        </div>

        {/* Right sidebar: all 3 featured, active one highlighted */}
        <div className="featured-list">
          {featuredItems.map((f, i) => (
            <button
              className={`feat-item${i === featIdx ? ' feat-item--active' : ''}`}
              key={f.name}
              onClick={() => goTo(i)}
            >
              <div className="feat-thumb">
                <img src={f.logo} alt={f.name} onError={e => e.target.style.opacity = '0'} />
              </div>
              <div className="feat-info">
                <div className="feat-name">{f.name}</div>
                <div className="feat-meta"><strong>{i === featIdx ? heroPlayers : f.players}</strong> / {f.max} players</div>
              </div>
              {i === featIdx && <div className="feat-active-bar" />}
            </button>
          ))}
        </div>
      </div>

      <div className="slabel slabel-trending"><Flame size={11} fill="currentColor" />Trending</div>

      <div className="cgrid-wrap cgrid-wrap-fit" ref={trendingWrapRef}>
        <div className="cgrid">
          {trendingVisible.map((s, i) => {
            const origIndex = SERVERS.indexOf(s);
            return (
              <GameCard
                key={s.name}
                server={s}
                banner={bannerList[origIndex]}
                logo={logoList[origIndex]}
                isFav={favs.has(s.name)}
                onToggleFav={onToggleFav}
                style={{ animationDelay: `${0.04 + i * 0.04}s` }}
              />
            );
          })}
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

/* ─────────────────────── View: Masterlist ──────────────────── */
function ViewMasterlist({ favs, onToggleFav }) {
  const bannerList = useRef(shuffle(Array.from({ length: SERVERS.length }, (_, i) => BANNERS[i % BANNERS.length]))).current;
  const logoList   = useRef(shuffle(Array.from({ length: SERVERS.length }, (_, i) => LOGOS[i % LOGOS.length]))).current;

  const [search, setSearch]         = useState('');
  const [activeTag, setActiveTag]   = useState(null);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SERVERS
      .filter(s => activeTag === null || s.genre === activeTag)
      .filter(s => !q || s.name.toLowerCase().includes(q) || s.genre.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [search, activeTag]);

  return (
    <div className="view active" id="view-masterlist">
      <div className="view-head">
        <div className="slabel">Masterlist</div>
        <div className="view-title-row"><span className="view-title">All Servers</span></div>
      </div>

      <div className="mlist-filters">
        <Filter
          className="mlist-filter-tags"
          buttonClassName="mlist-filter-btn"
          tags={ALL_GENRES}
          active={activeTag}
          onChange={setActiveTag}
        />
        <Search
          className="mlist-search"
          value={search}
          onChange={setSearch}
          placeholder="Search servers…"
          icon={<SearchIcon size={14} strokeWidth={2.5} />}
        />
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <SearchIcon size={40} strokeWidth={1.4} />
          <h3>No Servers Found</h3>
          <p>Try a different search term or clear the active filter.</p>
        </div>
      ) : (
        <div className="cgrid-wrap">
          <div className="cgrid">
            {results.map((s, i) => {
              const origIndex = SERVERS.indexOf(s);
              return (
                <GameCard
                  key={s.name}
                  server={s}
                  banner={bannerList[origIndex]}
                  logo={logoList[origIndex]}
                  isFav={favs.has(s.name)}
                  onToggleFav={onToggleFav}
                  style={{ animationDelay: `${0.04 + i * 0.04}s` }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── View: Settings ───────────────────── */
function ViewSettings() {
  const [vsync, setVsync]           = useState(true);
  const [quality, setQuality]       = useState('medium');
  const [drawDistance, setDrawDistance] = useState(100);
  const [volume, setVolume]         = useState(80);

  useEffect(() => {
    window.ipc?.postMessage(JSON.stringify({
      action: 'settings_update',
      settings: { vsync, quality, draw_distance_mult: drawDistance / 100, volume: volume / 100 },
    }));
  }, [vsync, quality, drawDistance, volume]);

  return (
    <div className="view active" id="view-settings">
      <div className="view-head">
        <div className="slabel">Preferences</div>
        <div className="view-title-row"><span className="view-title">Settings</span></div>
      </div>
      <div className="view-body">
        <div className="settings-section">
          <div className="settings-label">Graphics</div>
          <div className="setting-row">
            <div><div className="setting-name">VSync</div><div className="setting-desc">Sync frame rate to your monitor's refresh rate</div></div>
            <Toggle on={vsync} onChange={setVsync} />
          </div>
          <div className="setting-row">
            <div><div className="setting-name">Quality Preset</div><div className="setting-desc">Overall rendering quality — shadows, textures, effects</div></div>
            <div className="setting-control">
              <CustomSelect
                value={quality}
                onChange={setQuality}
                options={[
                  { value: 'low',    label: 'Low'    },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high',   label: 'High'   },
                ]}
              />
            </div>
          </div>
          <div className="setting-row">
            <div><div className="setting-name">Draw Distance</div><div className="setting-desc">Multiplier applied on top of the server's draw distance</div></div>
            <RangeSlider value={drawDistance} min={1} max={100} onChange={setDrawDistance} />
          </div>
          <div className="setting-row">
            <div><div className="setting-name">Game Volume</div><div className="setting-desc">Overall in-game audio volume</div></div>
            <RangeSlider value={volume} min={1} max={100} onChange={setVolume} />
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

  const handleExit = () => {};

  const views = {
    play:       <ViewPlay       favs={favs}    onToggleFav={toggleFav} />,
    masterlist: <ViewMasterlist favs={favs}    onToggleFav={toggleFav} />,
    favs:       <ViewFavs       favs={favs}    onToggleFav={toggleFav} />,
    settings:   <ViewSettings />,
  };

  const navItems = [
    { id: 'play',       icon: <LayoutGrid size={19} className="nav-btn-ico" />, title: 'Browse' },
    { id: 'masterlist', icon: <LayoutList size={19} className="nav-btn-ico" />, title: 'Masterlist' },
    { id: 'favs',       icon: <Star       size={19} className="nav-btn-ico" />, title: 'Favourites' },
    { id: 'settings',   icon: <Settings   size={19} className="nav-btn-ico" />, title: 'Settings' },
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
          <IconButton icon={<Download size={15} />} title="Downloads" />
          <IconButton icon={<X size={15} />} title="Exit Game" onClick={handleExit} />
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
