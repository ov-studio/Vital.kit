// Animation timing config — tweak freely.
export const CONFIG = {
  startDelay:  1000,  // ms of silence before anything begins
  strokeSpeed: 1.2,   // multiplier on all stroke draw durations (higher = slower)
  holdSandbox: 2000,  // ms to hold Vital.sandbox logo after fully revealed
  holdIcon:    1800,  // ms to hold Godot icon after fully revealed
  gapGlitch:   1000,  // ms of suspense gap between the two logos

  // ── Exit sequence ──────────────────────────────────────────────────────────
  // Stage 1 — Godot logo + scene fade to black:
  //   The Godot logo (and all scene layers) fade out first while the black
  //   curtain simultaneously fades IN. Duration below controls both.
  fadeToBlack:       700,   // ms for the curtain to reach solid opaque black
                            // (Godot logo is fully hidden before this ends)

  // Stage 2 — Hold on black:
  //   A moment of pure black silence after the scene is fully hidden and
  //   before the black itself starts fading away.
  blackHoldDelay:    300,   // ms to hold on solid black before fading out

  // Stage 3 — Black fades to transparent:
  //   The black curtain dissolves away, revealing whatever is behind the
  //   overlay (i.e. Vital.sandbox). The Godot logo is already gone.
  fadeToTransparent: 900,   // ms for black to fade away to fully transparent
};

// Absolute time from page load
export const D = (t) => CONFIG.startDelay + t;

// Scaled stroke duration
export const S = (ms) => Math.round(ms * CONFIG.strokeSpeed);
