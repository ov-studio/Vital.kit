import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    react(),
    // Bundles the entire app (JS + CSS) into one dist/index.html with
    // no separate asset files. Drop that single file straight into
    // Godot's WebView - no server, no relative-path asset management.
    viteSingleFile(),
  ],
  build: {
    outDir: '../',
    // single output chunk, no hashed filenames needed since
    // viteSingleFile inlines everything anyway
    assetsInlineLimit: 100000000,
    // Conservative target: the console renders inside whatever native
    // WebView backend the OS provides (WebView2/Chromium on Windows,
    // WebKitGTK on Linux, WKWebView on macOS) rather than a browser you
    // control the version of. es2020 is broadly supported by all three
    // as of 2024+ and avoids relying on the newest syntax unnecessarily.
    target: 'es2020'
  }
});
