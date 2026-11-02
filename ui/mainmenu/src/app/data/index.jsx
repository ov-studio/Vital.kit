import * as react      from 'react';
import * as app_events from '../events.js';
import * as app_config from '../config.js';
import * as app_hooks  from '../hooks.js';

const text = v => (typeof v === 'string' ? v.trim() : '');
const link = v => (/^https?:\/\//i.test(text(v)) ? text(v) : null);
const image = v => (/^https:\/\//i.test(text(v)) ? text(v) : null);

const count = v => (Number.isFinite(v) ? Math.max(0, v) : 0);
const tag_list = v => (Array.isArray(v) ? [...new Set(v.filter(t => typeof t === 'string').map(t => t.trim().toLowerCase()).filter(Boolean))].slice(0, 6) : []);

function build(row, id, name, ip) {
  const players = count(row.players);
  const max     = count(row.max_players ?? row.max_peers);
  return {
    id,
    name,
    desc: text(row.description),
    players,
    max,
    full: max > 0 && players >= max,
    discord: link(row.discord),
    site: link(row.website),
    logo: image(row.logo),
    banner: image(row.banner),
    ip,
    port: row.port,
    http_port: Number.isInteger(row.http_port) ? row.http_port : -1,
    version: text(row.version),
    tags: tag_list(row.tags),
  };
}

function normalize(row) {
  if (!row || typeof row !== 'object' || typeof row.id !== 'string') return null;
  const name = text(row.name);
  if (!name || typeof row.ip !== 'string' || !Number.isInteger(row.port)) return null;
  return build(row, row.id, name, row.ip);
}

function normalize_local(row) {
  if (!row || typeof row !== 'object' || !Number.isInteger(row.port)) return null;
  return { ...build(row, `local:${row.port}`, text(row.name) || `Local server :${row.port}`, app_config.LOCAL_HOST), local: true };
}

export const is_connected_to = (connection, server) => connection.state !== 'idle'
  && connection.port === server.port
  && (connection.ip === server.ip || (server.local && app_events.is_loopback(connection.ip)));

export function useLocalServers(active) {
  const rows = app_hooks.useEventState('mainmenu:localservers', app_events.get_localservers);
  app_hooks.usePolling(app_events.scan_local_servers, app_config.LOCAL_SCAN_INTERVAL, active);
  return react.useMemo(
    () => rows.map(normalize_local).filter(Boolean).sort((a, b) => a.port - b.port),
    [rows]
  );
}

export function useMasterlist() {
  const state = app_hooks.useEventState('mainmenu:masterlist', app_events.get_masterlist);
  const servers = react.useMemo(
    () => state.servers.map(normalize).filter(Boolean).sort((a, b) => b.players - a.players),
    [state.servers]
  );
  return { status: state.status, servers };
}

export function useConnectedServer(connection) {
  const { servers } = useMasterlist();
  const local = useLocalServers(false);
  return react.useMemo(() => [...local, ...servers].find(s => is_connected_to(connection, s)), [local, servers, connection]);
}

export function useMasterlistPolling() {
  const refresh = app_hooks.useEventState('mainmenu:init', app_events.get_masterlist_refresh);
  app_hooks.usePolling(app_events.fetch_masterlist, refresh);
}

export function emptyText(status, filtered) {
  if (status === 'loading') return 'Loading servers…';
  if (status === 'error') return 'The masterlist is unavailable right now. Check your connection; it retries automatically.';
  return filtered ? 'No servers found. Try a different search term or clear the active filter.' : 'No servers are online right now.';
}

export function filter_tags(servers) {
  const counts = new Map();
  for (const s of servers) for (const tag of s.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a) || a.localeCompare(b));
}

export function matches_tag(server, tag) {
  return tag === null || server.tags.includes(tag);
}

function normalize_post(row) {
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
    url: `${app_config.SITE_URL}/news/${slug.split('/').map(encodeURIComponent).join('/')}`,
  };
}

export function useNews(active) {
  const state = app_hooks.useEventState('mainmenu:news', app_events.get_news);
  app_hooks.usePolling(app_events.fetch_news, app_config.NEWS_REFRESH, active);
  const posts = state.posts.map(normalize_post).filter(Boolean).sort((a, b) => b.time - a.time);
  return { status: state.status, posts };
}
