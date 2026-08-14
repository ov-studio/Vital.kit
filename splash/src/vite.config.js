import * as vite           from 'vite';
import * as viteSingleFile from 'vite-plugin-singlefile';

export default vite.defineConfig({
  plugins: [
    viteSingleFile.viteSingleFile()
  ],
  build: {
    outDir: '../build',
    assetsInlineLimit: 100000000,
    target: 'es2022'
  }
});
