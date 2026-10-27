# Overview

The Vital.kit splash screen. A neon logo draws itself, flickers, ignites, then fades out and lets the game know it can hide the splash.

Built with Vite and vanilla JS. The result is a single `build/index.html` loaded by Godot.

## Usage

```
npm install
npm run dev       # develop with hot reload (runs without Godot)
npm run build     # outputs ../build/index.html
```

Animation timings and logo settings live in `app/config.js`.
