import * as fs                from 'fs';
import * as path              from 'path';
import * as vite              from 'vite';
import * as react             from '@vitejs/plugin-react';
import * as vite_singlefile   from 'vite-plugin-singlefile';
import * as shared_kit_plugin from '../../shared/kit-plugin.js';

export default vite.defineConfig({
  plugins: [
    react.default(),
    vite_singlefile.viteSingleFile(),
    shared_kit_plugin.kit_plugin()
  ],

  build: {
    outDir: '../build',
    assetsInlineLimit: 100000000,
    target: 'es2022'
  }
});
