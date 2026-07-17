import * as fs from 'fs';
import * as path from 'path';
import * as vite from 'vite';
import * as react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const kit_plugin = () => ({
  name: 'kit',
  configureServer(server) {
    server.middlewares.use('/kit', (req, res) => {
      try {
        const manifest_path = path.resolve(__dirname, '../../js/manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifest_path, 'utf-8'));
        const bundle = manifest.sources
          .map(src => fs.readFileSync(path.resolve(__dirname, '../../js', src), 'utf-8'))
          .join('\n');
        res.setHeader('Content-Type', 'application/javascript');
        res.end(bundle);
      } catch (e) {
        res.statusCode = 500;
        res.end(`console.error('kit failed: ${e.message}')`);
      }
    });
  }
});

export default vite.defineConfig({
  plugins: [
    react.default(),
    // Bundles the entire app (JS + CSS) into one dist/index.html with
    // no separate asset files. Drop that single file straight into
    // Godot's WebView - no server, no relative-path asset management.
    viteSingleFile(),
    kit_plugin()
  ],
  build: {
    outDir: '../build',
    // single output chunk, no hashed filenames needed since
    // viteSingleFile inlines everything anyway
    assetsInlineLimit: 100000000,
    // Conservative target: the console renders inside whatever native
    // WebView backend the OS provides (WebView2/Chromium on Windows,
    // WebKitGTK on Linux, WKWebView on macOS) rather than a browser you
    // control the version of. es2020 is broadly supported by all three
    // as of 2024+ and avoids relying on the newest syntax unnecessarily.
    target: 'es2022'
  }
});
