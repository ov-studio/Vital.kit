# Overview

The Vital.kit splash screen. A neon logo draws itself, flickers, ignites, then fades out and lets the game know it can hide the splash.

Built with Vite and vanilla JS. The result is a single `build/index.html` loaded by Godot.

## Configuration

- `app/config.js` - animation timings and logo stroke settings

## Usage

```
npm install
npm run dev       # develop with hot reload (runs without Godot)
npm run build     # outputs ../build/index.html
```
