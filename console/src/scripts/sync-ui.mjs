#!/usr/bin/env node
// Pulls Vital.site's frontend/ui/ component set from vital-sandbox.com/cdn/ui/
// into src/app/shared-ui/ before dev/build — same idea as theme.css/global.css
// being pulled in via <link> tags, except these need to exist on disk for
// Vite to bundle them. src/app/shared-ui/ is generated and gitignored;
// Vital.site/frontend/ui/ remains the single source of truth.

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CDN_BASE   = process.env.VITAL_UI_CDN ?? 'https://vital-sandbox.com/cdn/ui';
const TARGET_DIR = path.resolve(__dirname, '../app/shared-ui');

// Each component lives in its own folder: <name>/index.jsx (+ index.css).
const FILES = [
  'card/index.jsx', 'card/index.css',
  'iconbutton/index.jsx', 'iconbutton/index.css',
  'tagpill/index.jsx', 'tagpill/index.css',
  'filter/index.jsx', 'filter/index.css',
  'search/index.jsx', 'search/index.css',
];

async function fetch_file(rel_path) {
  const url = `${CDN_BASE}/${rel_path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

async function main() {
  let failed = false;

  for (const rel_path of FILES) {
    const dest = path.join(TARGET_DIR, rel_path);
    try {
      const text = await fetch_file(rel_path);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, text, 'utf8');
      console.log(`  synced: ${rel_path}`);
    } catch (err) {
      failed = true;
      console.warn(`[sync-ui] failed to fetch ${rel_path}: ${err.message}`);
    }
  }

  if (failed && !fs.existsSync(path.join(TARGET_DIR, 'card/index.jsx'))) {
    console.error('[sync-ui] no shared-ui files available locally and fetch failed — aborting build');
    process.exit(1);
  }

  console.log('[sync-ui] done');
}

main();
