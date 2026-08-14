// Animation timing config — tweak freely.
export const CONFIG = {
  startDelay:  1000,  // ms of silence before anything begins
  strokeSpeed: 1.2,   // multiplier on all stroke draw durations (higher = slower)
  holdSandbox: 2000,  // ms to hold Vital.sandbox logo after fully revealed
  holdIcon:    1800,  // ms to hold Godot icon after fully revealed
  gapGlitch:   1000,  // ms of suspense gap between the two logos
  fadeToBlack:       700,   // ms for the curtain to reach solid opaque black
  fadeToTransparent: 900,   // ms for that black to then fade away to nothing
};

// Absolute time from page load
export const D = (t) => CONFIG.startDelay + t;

// Scaled stroke duration
export const S = (ms) => Math.round(ms * CONFIG.strokeSpeed);
