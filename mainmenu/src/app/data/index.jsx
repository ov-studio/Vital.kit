import * as events from '../events.js';
import * as config from '../config.js';
import { useEventState, usePolling } from '../hooks.js';

/* Live server data. The host fetches the Vital.site masterlist (GET /masterlist) and hands the rows over;
   everything the menu lists (Featured, Trending, Masterlist, Favourites) is derived from them here. */

const text = v => (typeof v === 'string' ? v.trim() : '');
const link = v => (/^https?:\/\//i.test(text(v)) ? text(v) : null);
const image = v => (/^https:\/\//i.test(text(v)) ? text(v) : null);

/* Masterlist row -> what the cards render. Defensive: the API is remote, so every field is checked. */
export function normalize(row) {
  if (!row || typeof row !== 'object' || typeof row.id !== 'string') return null;
  const name = text(row.name);
  if (!name || typeof row.ip !== 'string' || !Number.isInteger(row.port)) return null;
  const players = Number.isFinite(row.players) ? Math.max(0, row.players) : 0;
  const max     = Number.isFinite(row.max_players) ? Math.max(0, row.max_players) : 0;
  return {
    id: row.id,
    name,
    desc: text(row.description),
    players,
    max,
    full: max > 0 && players >= max,
    discord: link(row.discord),
    site: link(row.website),
    logo: image(row.logo),
    banner: image(row.banner),
    ip: row.ip,
    port: row.port,
    http_port: Number.isInteger(row.http_port) ? row.http_port : -1,
    version: text(row.version),
    tags: Array.isArray(row.tags) ? [...new Set(row.tags.filter(t => typeof t === 'string').map(t => t.trim().toLowerCase()).filter(Boolean))].slice(0, 6) : [],
  };
}

export function useMasterlist() {
  const state = useEventState('mainmenu:masterlist', events.get_masterlist);
  const servers = state.servers.map(normalize).filter(Boolean).sort((a, b) => b.players - a.players);
  return { status: state.status, servers };
}

/* Keeps the list live: fetch now, on every refresh interval (the host may change it), and whenever the menu is shown again.
   Mount once (the list is cached in events.js and shared). */
export function useMasterlistPolling() {
  const refresh = useEventState('mainmenu:init', events.get_masterlist_refresh);
  usePolling(events.fetch_masterlist, refresh);
}

/* What an empty list means: still loading, API down, or genuinely nobody online. */
export function emptyText(status, filtered) {
  if (status === 'loading') return 'Loading servers…';
  if (status === 'error') return 'The masterlist is unavailable right now. Check your connection; it retries automatically.';
  return filtered ? 'No servers found. Try a different search term or clear the active filter.' : 'No servers are online right now.';
}

/* Masterlist filter chips: the tags servers declare in their config (server.tags), most used first. */
export function filter_tags(servers) {
  const counts = new Map();
  for (const s of servers) for (const tag of s.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a) || a.localeCompare(b));
}

export function matches_tag(server, tag) {
  return tag === null || server.tags.includes(tag);
}

/* ---- News ---------------------------------------------------------------- */

/* News row -> what the widget renders. Defensive like normalize(): the API is remote. */
export function normalize_post(row) {
  if (!row || typeof row !== 'object') return null;
  const slug = text(row.slug);
  const title = text(row.title);
  if (!slug || !title) return null;
  const time = Date.parse(row.date);
  return {
    slug,
    title,
    desc: text(row.description),
    author: text(row.author),
    cover: image(row.cover),
    time: Number.isNaN(time) ? 0 : time,
    date: Number.isNaN(time) ? '' : new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
    tags: Array.isArray(row.tags) ? row.tags.filter(t => typeof t === 'string' && t.trim()).slice(0, 3) : [],
    url: `${config.SITE_URL}/news/${slug.split('/').map(encodeURIComponent).join('/')}`,
  };
}

/* Latest posts (newest first). Fetches while `active`: now, every few minutes, and when the menu is shown again. */
export function useNews(active) {
  const state = useEventState('mainmenu:news', events.get_news);
  usePolling(events.fetch_news, config.NEWS_REFRESH, active);

  const posts = state.posts.map(normalize_post).filter(Boolean).sort((a, b) => b.time - a.time);
  return { status: state.status, posts };
}
