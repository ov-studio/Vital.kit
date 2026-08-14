import * as fs             from 'fs';
import * as path           from 'path';
import * as vite           from 'vite';
import * as viteSingleFile from 'vite-plugin-singlefile';

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
      }
      catch (e) {
        res.statusCode = 500;
        res.end(`console.error('kit failed: ${e.message}')`);
      }
    });
  }
});

export default vite.defineConfig({
  plugins: [
    viteSingleFile.viteSingleFile(),
    kit_plugin()
  ],
  build: {
    outDir: '../build',
    assetsInlineLimit: 100000000,
    target: 'es2022'
  }
});
