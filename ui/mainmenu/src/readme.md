# Overview

The Vital.kit main menu: browse servers, view news, manage favourites and change settings. It shares its look with the Vital.sandbox website.

Built with Vite and React. The result is a single `build/index.html` loaded by Godot.

## Configuration

- `../../../shared/config.js` - domain and site links
- `app/config.js` - menu options, timings and settings defaults

## Local server

If a Vital.server is running on your machine, the Masterlist view lists it first as a "Local · Preview" card (cover, logo, description, tags), so the owner can check how it will look before it is published. Connect and Leave work from the card.

## Usage

```
npm install
npm run dev       # develop with hot reload (runs without Godot)
npm run build     # outputs ../build/index.html
```
