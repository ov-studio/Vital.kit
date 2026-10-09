import { useState, useEffect } from 'react';
import * as events from '../events.js';

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
  const max     = Number.isFinite(row.maxPlayers) ? Math.max(0, row.maxPlayers) : 0;
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
    http_port: Number.isInteger(row.httpPort) ? row.httpPort : -1,
    version: text(row.version),
    tags: Array.isArray(row.tags) ? [...new Set(row.tags.filter(t => typeof t === 'string').map(t => t.trim().toLowerCase()).filter(Boolean))].slice(0, 6) : [],
  };
}

export function useMasterlist() {
  const [state, setState] = useState(events.get_masterlist);
  useEffect(() => {
    const on = e => setState(e.detail);
    window.addEventListener('mainmenu:masterlist', on);
    return () => window.removeEventListener('mainmenu:masterlist', on);
  }, []);

  const servers = state.servers.map(normalize).filter(Boolean).sort((a, b) => b.players - a.players);
  return { status: state.status, servers };
}

/* Keeps the list live: fetch now, on every refresh interval, and whenever the menu is shown again.
   Mount once (the list is cached in events.js and shared). */
export function useMasterlistPolling() {
  useEffect(() => {
    const faded = () => document.documentElement.classList.contains('is-faded');
    let timer;
    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => { if (!faded()) events.fetch_masterlist(); }, events.get_masterlist_refresh());
    };
    const refresh = () => { events.fetch_masterlist(); start(); };
    const on_visible = e => { if (e.detail?.visible) refresh(); };

    refresh();
    window.addEventListener('mainmenu:init', start); // host may set a different interval
    window.addEventListener('webview:visible', on_visible);
    return () => {
      clearInterval(timer);
      window.removeEventListener('mainmenu:init', start);
      window.removeEventListener('webview:visible', on_visible);
    };
  }, []);
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
