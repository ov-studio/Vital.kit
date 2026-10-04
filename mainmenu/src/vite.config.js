import * as path              from 'path';
import * as vite              from 'vite';
import * as react             from '@vitejs/plugin-react';
import * as vite_singlefile   from 'vite-plugin-singlefile';
import * as shared_kit_plugin from '../../shared/kit-plugin.js';
import { fileURLToPath }      from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// shared/ui sits outside this project, so bare imports made from inside it
// (react, lucide-react) would never reach our node_modules. Pin them here.
const shared_deps = ['react', 'react-dom', 'lucide-react'];

export default vite.defineConfig({
  plugins: [
    react.default(),
    vite_singlefile.viteSingleFile(),
    shared_kit_plugin.kit_plugin()
  ],

  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, '../../shared/ui'),
      ...Object.fromEntries(shared_deps.map(dep => [dep, path.resolve(__dirname, 'node_modules', dep)])),
    },
    dedupe: shared_deps,
  },

  build: {
    outDir: '../build',
    target: 'es2022'
  }
});
