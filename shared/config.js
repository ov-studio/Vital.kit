// Vital domains and URLs: the ONE place they are defined.
// Used by the mainmenu app, the dev/build tooling (kit-plugin, sync-ui) and the
// {{site}} / {{cdn}} tokens in every index.html. Change DOMAIN here and it changes everywhere.
// Plain ESM with no imports, so it loads in both the browser bundle and Node.

export const DOMAIN = 'vital-sandbox.com';

const origin = (subdomain) => `https://${subdomain ? `${subdomain}.` : ''}${DOMAIN}`;

export const SITE    = origin();                // https://vital-sandbox.com
export const API     = origin('api');           // https://api.vital-sandbox.com
export const DISCORD = origin('discord');       // invite redirect
export const DONATE  = origin('kofi');          // donation redirect

export const DOCS    = `${SITE}/docs`;
export const NEWS    = `${API}/news`;           // GET -> { posts: [...] }
export const CDN     = `${SITE}/cdn`;           // theme.css, global.css
export const UI_CDN  = `${CDN}/ui`;             // shared component set (see scripts/sync-ui.mjs)
