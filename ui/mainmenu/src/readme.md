# Overview

The Vital.kit main menu: browse servers, view news, manage favourites and change settings. It shares its look with the Vital.sandbox website.

Built with Vite and React. The result is a single `build/index.html` loaded by Godot.

## Configuration

- `../../../shared/config.js` - domain and site links
- `app/config.js` - menu options, timings and settings defaults

## Local server

If a Vital.server is running on your machine, the Browse view shows a "Local server" bar with a Connect button.

## Usage

```
npm install
npm run dev       # develop with hot reload (runs without Godot)
npm run build     # outputs ../build/index.html
```
