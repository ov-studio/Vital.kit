import * as fs             from 'fs';
import * as path           from 'path';
import * as vite           from 'vite';
import * as react          from '@vitejs/plugin-react';
import * as viteSingleFile from 'vite-plugin-singlefile';

export default vite.defineConfig({
  plugins: [
    react.default(),
    // Bundles the entire app (JS + CSS) into one dist/index.html with
    // no separate asset files. Drop that single file straight into
    // Godot's WebView — no server, no relative-path asset management.
    viteSingleFile.viteSingleFile(),
  ],
  build: {
    outDir: '../build',
    assetsInlineLimit: 100000000,
    // Conservative target: runs inside Godot's native WebView backend
    // (WebView2/Chromium on Windows, WebKitGTK on Linux, WKWebView on macOS).
    target: 'es2022'
  }
});
