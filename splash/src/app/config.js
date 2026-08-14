// Animation timing — tweak freely.
export const CONFIG = {
  startDelay:  1000,  // ms of pure black before anything starts
  strokeSpeed: 1.2,   // stroke draw speed multiplier (higher = slower)
  holdSandbox: 2000,  // ms to hold the Vital.sandbox logo after reveal
  holdIcon:    1800,  // ms to hold the Godot icon after reveal
  gapGlitch:   1000,  // ms of suspense gap between the two logos

  // Exit sequence (three stages):
  fadeToBlack:       700,  // 1. curtain fades in / logo + scene fade out
  blackHoldDelay:    300,  // 2. hold on solid black
  fadeToTransparent: 900,  // 3. black dissolves to transparent
};

// Absolute time from page load
export const D = (t) => CONFIG.startDelay + t;

// Scaled stroke duration
export const S = (ms) => Math.round(ms * CONFIG.strokeSpeed);
