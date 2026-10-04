import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import {
  LayoutGrid, LayoutList, Star, Flame, Settings, Play, UsersRound,
  ExternalLink, Globe, Download, X, Search as SearchIcon
} from 'lucide-react';
import { SERVERS, FEATURED, GENRES } from './data.jsx';
import { Brand }          from '@ui/brand';
import { Button }         from '@ui/button';
import { Card }           from '@ui/card';
import { Checkbox }       from '@ui/checkbox';
import { Divider }        from '@ui/divider';
import { EmptyState }     from '@ui/empty';
import { Filter }         from '@ui/filter';
import { IconButton }     from '@ui/iconbutton';
import { PageHead }       from '@ui/pagehead';
import { Panel }          from '@ui/panel';
import { Search }         from '@ui/search';
import { Section }        from '@ui/section';
import { Select }         from '@ui/select';
import { Stat, StatGrid } from '@ui/stat';
import { TagPill }        from '@ui/tagpill';

const NAV = [
  { id: 'play',       icon: LayoutGrid, title: 'Browse'     },
  { id: 'masterlist', icon: LayoutList, title: 'Masterlist' },
  { id: 'favs',       icon: Star,       title: 'Favourites' },
  { id: 'settings',   icon: Settings,   title: 'Settings'   },
];

const HUD_LINKS = ['Documentation', 'Discord', 'Donate'];

const QUALITY_OPTIONS = [
  { value: 'low',    label: 'Low'    },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High'   },
];

/* Card grid geometry. The CSS reads it back through custom properties (see
   GRID_VARS), so useFitCount and the stylesheet can never drift apart. */
const CARD = { minWidth: 210, gap: 14, ratio: 3 / 4 };
const GRID_VARS = {
  '--card-min':   `${CARD.minWidth}px`,
  '--card-gap':   `${CARD.gap}px`,
  '--card-ratio': CARD.ratio,
};

const FEATURED_INTERVAL = 5000; // ms between featured servers

const hideBroken = e => { e.target.style.opacity = '0'; };

/* ───────────── fit-to-space hook (no scroller, most cards win) ───────────── */
function useFitCount(ref) {
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

/* ────────────────────── Discord SVG ────────────────────────── */
function DiscordSvg({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor">
      <path d="M10.2 1.9A9.4 9.4 0 007.7 1.2a6.6 6.6 0 00-.3.6 8.7 8.7 0 00-2.8 0 6.2 6.2 0 00-.3-.6A9.4 9.4 0 001.8 1.9C.6 3.9.2 5.7.3 7.4a9.7 9.7 0 002.9 1.5 7 7 0 00.6-1 6.2 6.2 0 01-1-.5l.2-.2a7 7 0 006 0l.2.2a6.2 6.2 0 01-.9.4 7 7 0 00.6 1 9.7 9.7 0 002.9-1.5c.1-2.1-.4-3.9-1.6-5.4zM4.1 6.2c-.6 0-1-.5-1-1.2s.4-1.2 1-1.2 1 .5 1 1.2-.4 1.2-1 1.2zm3.8 0c-.6 0-1-.5-1-1.2s.4-1.2 1-1.2 1 .5 1 1.2-.4 1.2-1 1.2z"/>
    </svg>
  );
}

/* ─────────────────────── Game card ─────────────────────────── */
function GameCard({ server, isFav, onToggleFav, showTag, style }) {
  return (
    <Card
      className="gcard"
      style={style}
      cover={server.banner}
      coverAlt={server.name}
      onCoverError={hideBroken}
      topLeft={showTag && <TagPill label={server.genre} />}
      topRight={
        <IconButton
          className={`gc-btn gc-fav${isFav ? ' on' : ''}`}
          icon={Star}
          iconProps={{ size: 13, strokeWidth: 1.6 }}
          title="Favourite"
          onClick={() => onToggleFav(server.name)}
        />
      }
      title={server.name}
      description={server.desc}
      footer={
        <>
          <span className="gc-stat">
            <UsersRound size={11} fill="currentColor" />
            <strong>{server.players}</strong>/{server.max}
          </span>
          <div className="gc-links">
            {server.discord && <IconButton className="gc-btn" icon={DiscordSvg} iconProps={{ size: 12 }} title="Discord" />}
            {server.site && <IconButton className="gc-btn" icon={Globe} iconProps={{ size: 12, strokeWidth: 1.6 }} title="Site" />}
            <Button variant="action" className="gjoin" disabled={server.status === 'full'}>
              {server.status === 'full' ? 'Full' : <><Play size={9} fill="currentColor" />Play</>}
            </Button>
          </div>
        </>
      }
    />
  );
}

function CardGrid({ servers, favs, onToggleFav, showTag }) {
  return (
    <div className="cgrid" style={GRID_VARS}>
      {servers.map((s, i) => (
        <GameCard
          key={s.name}
          server={s}
          isFav={favs.has(s.name)}
          onToggleFav={onToggleFav}
          showTag={showTag}
          style={{ animationDelay: `${0.04 + i * 0.04}s` }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────── View: Play ────────────────────────── */
function ViewPlay({ visible, favs, onToggleFav }) {
  const trending = useMemo(() => [...SERVERS].sort((a, b) => b.players - a.players), []);
  const gridRef = useRef(null);
  const fitCount = useFitCount(gridRef);

  // Index and live player count change together, so the count never lags a switch.
  const [hero, setHero] = useState({ idx: 0, players: FEATURED[0].players });
  const active = FEATURED[hero.idx];

  const go = idx => setHero({ idx, players: FEATURED[idx].players });

  // Both timers pause while the view is hidden, which also keeps the progress dot in sync.
  // Any change of idx (auto-cycle or click) restarts them.
  useEffect(() => {
    if (!visible) return;
    const cycle = setTimeout(() => go((hero.idx + 1) % FEATURED.length), FEATURED_INTERVAL);
    const jitter = setInterval(() => {
      setHero(h => ({ ...h, players: Math.max(1, Math.min(active.max, h.players + Math.floor(Math.random() * 6) - 3)) }));
    }, 5000);
    return () => { clearTimeout(cycle); clearInterval(jitter); };
  }, [visible, hero.idx]);

  return (
    <div className="view">
      <div className="slabel"><Star size={11} fill="currentColor" />Featured</div>
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
          <div className="hero-dots" style={{ '--cycle': `${FEATURED_INTERVAL}ms` }}>
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

      <div className="slabel"><Flame size={11} fill="currentColor" />Trending</div>
      <div className="cgrid-wrap cgrid-wrap--fit" ref={gridRef}>
        <CardGrid servers={fitCount == null ? trending : trending.slice(0, fitCount)} favs={favs} onToggleFav={onToggleFav} />
      </div>
    </div>
  );
}

/* ─────────────────────── View: Favourites ──────────────────── */
function ViewFavs({ favs, onToggleFav }) {
  const favServers = SERVERS.filter(s => favs.has(s.name));

  return (
    <div className="view">
      <PageHead label="Your Library" title="Favourites" />
      {favServers.length === 0 ? (
        <EmptyState icon={<Star size={40} strokeWidth={1.4} />}>
          No favourites yet. Click the star icon on any game card to save it here.
        </EmptyState>
      ) : (
        <div className="cgrid-wrap">
          <CardGrid servers={favServers} favs={favs} onToggleFav={onToggleFav} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── View: Masterlist ──────────────────── */
function ViewMasterlist({ favs, onToggleFav }) {
  const [search, setSearch]       = useState('');
  const [activeTag, setActiveTag] = useState(null);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SERVERS
      .filter(s => activeTag === null || s.genre === activeTag)
      .filter(s => !q || s.name.toLowerCase().includes(q) || s.genre.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [search, activeTag]);

  return (
    <div className="view">
      <PageHead label="Masterlist" title="All Servers" />

      <div className="mlist-filters">
        <Filter tags={GENRES} active={activeTag} onChange={setActiveTag} />
        <Search
          value={search}
          onChange={setSearch}
          placeholder="Search servers…"
          icon={<SearchIcon size={14} strokeWidth={2.5} />}
        />
      </div>
      <Divider />

      {results.length === 0 ? (
        <EmptyState icon={<SearchIcon size={40} strokeWidth={1.4} />}>
          No servers found. Try a different search term or clear the active filter.
        </EmptyState>
      ) : (
        <div className="cgrid-wrap">
          <CardGrid servers={results} favs={favs} onToggleFav={onToggleFav} showTag />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── View: Settings ───────────────────── */
function RangeSlider({ label, value, onChange, min = 1, max = 100 }) {
  return (
    <div className="rslider">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        value={value}
        style={{ '--fill': `${((value - min) / (max - min)) * 100}%` }}
        onChange={e => onChange(Number(e.target.value))}
      />
      <span className="rslider-value">{value}%</span>
    </div>
  );
}

function SettingRow({ name, desc, children }) {
  return (
    <div className="setting-row">
      <div>
        <div className="setting-name">{name}</div>
        <div className="setting-desc">{desc}</div>
      </div>
      <div className="setting-control">{children}</div>
    </div>
  );
}

function ViewSettings() {
  const [vsync, setVsync]               = useState(true);
  const [quality, setQuality]           = useState('medium');
  const [drawDistance, setDrawDistance] = useState(100);
  const [volume, setVolume]             = useState(80);

  useEffect(() => {
    window.ipc?.postMessage(JSON.stringify({
      action: 'settings_update',
      settings: { vsync, quality, draw_distance_mult: drawDistance / 100, volume: volume / 100 },
    }));
  }, [vsync, quality, drawDistance, volume]);

  return (
    <div className="view">
      <PageHead label="Preferences" title="Settings" />
      <div className="view-body">
        <Section>Graphics</Section>
        <Panel>
          <SettingRow name="VSync" desc="Sync frame rate to your monitor's refresh rate">
            <Checkbox label="Enabled" checked={vsync} onChange={setVsync} />
          </SettingRow>
          <SettingRow name="Quality Preset" desc="Overall rendering quality — shadows, textures, effects">
            <Select value={quality} onChange={setQuality} options={QUALITY_OPTIONS} aria-label="Quality preset" />
          </SettingRow>
          <SettingRow name="Draw Distance" desc="Multiplier applied on top of the server's draw distance">
            <RangeSlider label="Draw distance" value={drawDistance} onChange={setDrawDistance} />
          </SettingRow>
        </Panel>

        <Section>Audio</Section>
        <Panel>
          <SettingRow name="Game Volume" desc="Overall in-game audio volume">
            <RangeSlider label="Game volume" value={volume} onChange={setVolume} />
          </SettingRow>
        </Panel>

        <Section>About</Section>
        <StatGrid minWidth="150px">
          <Stat label="Launcher" value="v2.4.1" />
          <Stat label="Build"    value="b3095-beta" />
          <Stat label="Scripting" value="Lua 5.4" />
          <Stat label="Engine"   value="Godot / C++17" />
          <Stat label="License"  value="Open Source" />
        </StatGrid>
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

  // Every view stays mounted (so filters, favourites and settings survive switching); only one is shown.
  const views = {
    play:       <ViewPlay visible={activeView === 'play'} favs={favs} onToggleFav={toggleFav} />,
    masterlist: <ViewMasterlist favs={favs} onToggleFav={toggleFav} />,
    favs:       <ViewFavs favs={favs} onToggleFav={toggleFav} />,
    settings:   <ViewSettings />,
  };

  return (
    <>
      <nav className="sidebar">
        {NAV.map(item => (
          <IconButton
            key={item.id}
            className={`nav-btn${activeView === item.id ? ' on' : ''}`}
            icon={item.icon}
            iconProps={{ size: 19, strokeWidth: 2 }}
            title={item.title}
            onClick={() => setActiveView(item.id)}
          />
        ))}
      </nav>

      <header className="hud">
        <div className="hud-logo">
          <Brand size="xs" variant="logo-only" />
        </div>
        <div className="hud-greet">Greetings, <strong>FallingStickman</strong></div>
        <nav className="hud-links">
          {HUD_LINKS.map(label => (
            <Button key={label} variant="action" size="lg">
              {label} <ExternalLink size={10} />
            </Button>
          ))}
        </nav>
        <IconButton icon={Download} iconProps={{ size: 15, strokeWidth: 2.2 }} title="Downloads" />
        <IconButton className="hud-exit" icon={X} iconProps={{ size: 15, strokeWidth: 2.2 }} title="Exit Game" />
      </header>

      <main className="center-panel">
        {Object.entries(views).map(([id, el]) => (
          <div key={id} className="view-slot" hidden={activeView !== id}>{el}</div>
        ))}
      </main>
    </>
  );
}
