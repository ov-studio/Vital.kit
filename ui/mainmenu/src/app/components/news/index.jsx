import * as react      from 'react';
import * as lucide     from 'lucide-react';
import * as app_empty  from '../empty/index.jsx';
import * as app_pic    from '../pic/index.jsx';
import * as app_data   from '../../data/index.jsx';
import * as app_events from '../../events.js';
import * as app_config from '../../config.js';
import * as app_util   from '../../util.js';
import './index.css';

const tints = new Map();
const SAMPLE = 24;
const MAX_LUMA = 0.22;

function average_color(img) {
  const c = document.createElement('canvas');
  c.width = c.height = SAMPLE;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
  const d = ctx.getImageData(0, 0, SAMPLE, SAMPLE).data;
  let r = 0, g = 0, b = 0, w = 0;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3] / 255;
    r += d[i] * a; g += d[i + 1] * a; b += d[i + 2] * a; w += a;
  }
  if (!w) return null;
  r /= w; g /= w; b /= w;
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const k = luma > MAX_LUMA ? MAX_LUMA / luma : 1;
  return `rgb(${Math.round(r * k)}, ${Math.round(g * k)}, ${Math.round(b * k)})`;
}

function useCoverTint(src) {
  const [tint, setTint] = react.useState(() => (src && tints.get(src)) || null);
  react.useEffect(() => {
    if (!src) { setTint(null); return; }
    if (tints.has(src)) { setTint(tints.get(src)); return; }
    setTint(null);
    let dead = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      let color = null;
      try { color = average_color(img); }
      catch {}
      tints.set(src, color);
      if (!dead) setTint(color);
    };
    img.onerror = () => { tints.set(src, null); };
    img.src = src;
    return () => { dead = true; };
  }, [src]);
  return tint;
}

function NewsItem({ post: p }) {
  const tint = useCoverTint(p.cover);
  return (
    <button className="news-item" style={tint ? { '--news-tint': tint } : undefined} onClick={() => app_events.open_url(p.url)}>
      <app_pic.Pic src={p.cover} className="news-cover"><lucide.Newspaper size={16}/></app_pic.Pic>
      <span className="news-info">
        <span className="news-title">{p.title}</span>
        <span className="news-meta">{[p.tags[0] && `#${p.tags[0]}`, p.date].filter(Boolean).join('  ·  ')}</span>
      </span>
      <lucide.ArrowUpRight className="news-go" size={14} strokeWidth={2.2}/>
    </button>
  );
}

function newsEmptyText(status) {
  if (status === 'loading') return 'Loading news…';
  if (status === 'error') return 'News is unavailable right now. It retries automatically.';
  return 'No news yet. Check back soon.';
}

export function News({ active }) {
  const { status, posts } = app_data.useNews(active);
  if (!posts.length) {
    return <app_empty.Empty icon={lucide.Newspaper} className="news app-empty--boxed">{newsEmptyText(status)}</app_empty.Empty>;
  }

  return (
    <div className="news">
      {posts.slice(0, app_config.NEWS_SLOTS).map((p) => <NewsItem key={p.slug} post={p}/>)}
      {app_util.slots(app_config.NEWS_SLOTS, posts.length).map((i) => (
        <div key={`open-${i}`} className="news-item news-item--open">
          <lucide.Newspaper size={16} strokeWidth={2}/>
          <span>No more news</span>
        </div>
      ))}
    </div>
  );
}
