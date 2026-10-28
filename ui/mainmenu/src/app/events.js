import { NEWS_URL, MASTERLIST_REFRESH } from './config.js';

let settings      = null;
let username      = null;
let nickname      = '';
let bind          = null;
let versions      = [];
let updates       = [];
let localservers  = [];
let masterlist_ms = MASTERLIST_REFRESH;
let masterlist    = { status: 'loading', servers: [] };
let news          = { status: 'loading', posts: [] };
let connection    = { state: 'idle', ip: '', port: 0, name: '' };
let notice        = null;
let manual_drop   = false;

const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const post = (payload) => window.ipc?.postMessage(JSON.stringify(payload));
const text = (v) => (typeof v === 'string' ? v.trim() : '');
const merge = (prev, key, rows) => rows
  ? { status: 'ok', [key]: rows }
  : { status: prev[key].length ? 'ok' : 'error', [key]: prev[key] };

function set_news(posts) {
  news = merge(news, 'posts', posts);
  emit('mainmenu:news', news);
}

function server_name(ip, port) {
  const listed = masterlist.servers.find(s => s?.ip === ip && s?.port === port);
  if (text(listed?.name)) return text(listed.name);
  const loopback = ip === '127.0.0.1' || ip === 'localhost';
  const local = loopback ? localservers.find(s => s?.port === port) : null;
  return text(local?.name);
}

// Decides whether going back to idle was an error worth telling the user about.
// The host may say so itself (d.event = 'kicked' | 'lost' | 'failed', d.reason);
// otherwise it is inferred from the state we were in when the link dropped.
function drop_notice(prev, d) {
  if (manual_drop) return null;
  const event = text(d.event).toLowerCase();
  const kind = d.kicked === true || event === 'kicked' || event === 'kick' ? 'kicked'
             : event === 'failed' || event === 'lost' ? event
             : prev.state === 'connecting' ? 'failed'
             : 'lost';
  return { kind, name: prev.name, ip: prev.ip, port: prev.port, reason: text(d.reason ?? d.message) };
}

function set_notice(next) {
  if (notice === next) return;
  notice = next;
  emit('mainmenu:notice', notice);
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
    const prev  = connection;
    const state = d.state ?? 'idle';
    const ip    = d.ip ?? '';
    const port  = d.port ?? 0;
    connection  = { state, ip, port, name: text(d.name) || server_name(ip, port) };

    if (state === 'idle') {
      if (prev.state !== 'idle') set_notice(drop_notice(prev, d));
      manual_drop = false;
    }
    else {
      manual_drop = false;
      set_notice(null);
    }
    emit('mainmenu:connection', connection);
  },

  settings(d) {
    if (d.settings) {
      settings = d.settings;
      nickname = typeof settings.nickname === 'string' ? settings.nickname.trim() : '';
      emit('mainmenu:settings_loaded', settings);
    }
    if (typeof d.username === 'string' && d.username) username = d.username;
    emit('mainmenu:username');
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
  catch {}
});

export const ready              = () => post({ action: 'ready' });
export const drag               = () => post({ action: 'drag' });
export const minimize           = () => post({ action: 'minimize' });
export const exit               = () => post({ action: 'exit' });
export const escape             = () => post({ action: 'escape' });
export const hide               = () => post({ action: 'hide' });
export const fetch_masterlist   = () => post({ action: 'masterlist' });
export const scan_local_servers = () => post({ action: 'localservers' });
export function disconnect() {
  manual_drop = true;
  post({ action: 'disconnect' });
}
export const dismiss_notice     = () => set_notice(null);
export function settings_update(values) {
  post({ action: 'settings_update', settings: values ?? {} });
  if (typeof values?.nickname === 'string') {
    nickname = values.nickname.trim();
    emit('mainmenu:username');
  }
}

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
export const get_os_username        = () => username;
export const get_username           = () => nickname || username;
export const get_bind               = () => bind;
export const get_versions           = () => versions;
export const get_updates            = () => updates;
export const get_localservers       = () => localservers;
export const get_masterlist         = () => masterlist;
export const get_masterlist_refresh = () => masterlist_ms;
export const get_news               = () => news;
export const get_connection         = () => connection;
export const get_notice             = () => notice;
