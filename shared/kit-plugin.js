import * as fs     from 'fs';
import * as path   from 'path';
import * as url    from 'url';
import * as config from './config.js';

// __dirname here is fixed at Vital.kit/shared/, regardless of which app's
// vite.config.js imports this — so the manifest path is resolved relative
// to this file's own location, not the caller's.
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// {{token}} placeholders usable in any index.html (values live in shared/config.js).
const html_tokens = { site: config.SITE, cdn: config.CDN };

export const kit_plugin = () => ({
  name: 'kit',

  // Fill {{site}} / {{cdn}} in index.html (dev and build). Unknown tokens are left untouched.
  transformIndexHtml: {
    order: 'pre',
    handler: (html) => html.replace(/\{\{(\w+)\}\}/g, (match, key) => html_tokens[key] ?? match)
  },

  // Dev only: serves the bundled game module so the browser can stub the host.
  configureServer(server) {
    server.middlewares.use('/kit', (req, res) => {
      try {
        const manifest_path = path.resolve(__dirname, '../module/js/manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifest_path, 'utf-8'));
        const bundle = manifest.sources
          .map(src => fs.readFileSync(path.resolve(__dirname, '../module/js', src), 'utf-8'))
          .join('\n');
        res.setHeader('Content-Type', 'application/javascript');
        res.end(bundle);
      }
      catch (e) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/javascript');
        res.end(`console.error(${JSON.stringify('kit failed: ' + e.message)})`);
      }
    });
  }
});
