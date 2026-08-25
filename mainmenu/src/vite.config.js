import * as fs                from 'fs';
import * as path              from 'path';
import * as vite              from 'vite';
import * as react             from '@vitejs/plugin-react';
import * as vite_singlefile   from 'vite-plugin-singlefile';
import * as shared_kit_plugin from '../../shared/kit-plugin.js';
import { fileURLToPath }      from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default vite.defineConfig({
  plugins: [
    react.default(),
    vite_singlefile.viteSingleFile(),
    shared_kit_plugin.kit_plugin()
  ],

  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },

  build: {
    outDir: '../build',
    assetsInlineLimit: 100000000,
    target: 'es2022'
  }
});
