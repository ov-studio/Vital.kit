import { NEWS_URL, MASTERLIST_REFRESH } from './config.js';

let settings        = null;
let username        = null;
let bind            = null;                                   // menu toggle key (config/mainmenu.json)
let versions        = [];                                     // [{ label, value }], display order
let updates         = [];                                     // outdated components only
let localservers    = [];
let masterlist_ms   = MASTERLIST_REFRESH;                     // config/masterlist.json `refresh`
let masterlist      = { status: 'loading', servers: [] };     // status: loading | ok | error
let news            = { status: 'loading', posts: [] };       // status: loading | ok | error
let connection      = { state: 'idle', ip: '', port: 0 };     // state: idle | connecting | connected

const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const post = (payload) => window.ipc?.postMessage(JSON.stringify(payload));
const merge = (prev, key, rows) => rows
  ? { status: 'ok', [key]: rows }
  : { status: prev[key].length ? 'ok' : 'error', [key]: prev[key] };

function set_news(posts) {
  news = merge(news, 'posts', posts);
  emit('mainmenu:news', news);
}

const incoming = {
  init(d) {
    if (typeof d.bind === 'string') bind = d.bind;
    if (Number.isInteger(d.masterlist_refresh)) masterlist_ms = d.masterlist_refresh;
    if (Array.isArray(d.versions)) versions = d.versions.filter(v => v && typeof v.label === 'string' && typeof v.value === 'string');
    emit('mainmenu:init');
  },

  update(d) {
    updates = Array.isArray(d.updates) ? d.updates : [];
    emit('mainmenu:update', updates);
  },

  masterlist(d) {
    masterlist = merge(masterlist, 'servers', d.ok && Array.isArray(d.servers) ? d.servers : null);
    emit('mainmenu:masterlist', masterlist);
  },

  news(d) {
    set_news(d.ok && Array.isArray(d.posts) ? d.posts : null);
  },

  localservers(d) {
    localservers = Array.isArray(d.servers) ? d.servers : [];
    emit('mainmenu:localservers', localservers);
  },

  connection(d) {
    connection = { state: d.state ?? 'idle', ip: d.ip ?? '', port: d.port ?? 0 };
    emit('mainmenu:connection', connection);
  },

  settings(d) {
    if (d.settings) {
      settings = d.settings;
      emit('mainmenu:settings_loaded', settings);
    }
    if (typeof d.username === 'string' && d.username) {
      username = d.username;
      emit('mainmenu:username', username);
    }
  },

  fadeout() {
    emit('mainmenu:fadeout');
  },
};

document.addEventListener('message', (e) => {
  try {
    const data = JSON.parse(e.detail);
    incoming[data?.action]?.(data);
  } 
  catch { /* ignore malformed host messages */ }
});

export const ready  = () => post({ action: 'ready' });
export const drag   = () => post({ action: 'drag' });
export const exit   = () => post({ action: 'exit' });
export const escape = () => post({ action: 'escape' });
export const hide   = () => post({ action: 'hide' });
export const fetch_masterlist = () => post({ action: 'masterlist' });
export const scan_local_servers = () => post({ action: 'localservers' });
export const disconnect = () => post({ action: 'disconnect' });
export const settings_update = (values) => post({ action: 'settings_update', settings: values ?? {} });

export function open_url(url) {
  if (/^https?:\/\//i.test(String(url ?? ''))) post({ action: 'open_url', url });
}

export function connect(ip, port, http_port) {
  if (typeof ip !== 'string' || !Number.isInteger(port)) return;
  post({ action: 'connect', ip, port, http_port: Number.isInteger(http_port) ? http_port : -1 });
}

export function update_download(name) {
  if (name) post({ action: 'update_download', name: String(name) });
}

export const update_apply = () => post({ action: 'update_apply' });

export async function fetch_news() {
  post({ action: 'news' });
  try {
    const res = await fetch(NEWS_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    set_news(Array.isArray(json?.posts) ? json.posts : null);
  } catch {
    if (news.status !== 'ok') set_news(null);
  }
}

export const get_settings           = () => settings;
export const get_username           = () => username;                 // OS username, null until ready
export const get_bind               = () => bind;                     // menu toggle key, null until ready
export const get_versions           = () => versions;                 // Sandbox, Kit, Wry, Godot
export const get_updates            = () => updates;                  // empty when up to date or unknown
export const get_localservers       = () => localservers;
export const get_masterlist         = () => masterlist;               // { status, servers } raw rows
export const get_masterlist_refresh = () => masterlist_ms;            // ms between masterlist refreshes
export const get_news               = () => news;                     // { status, posts } raw rows
export const get_connection         = () => connection;               // { state, ip, port }
