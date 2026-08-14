import { CONFIG, D, S }                                from './config.js';
import { flicker, stop_flicker, flash, ripple, burst } from './effects.js';

const $ = (id) => document.getElementById(id);
const BLUE = 'hsl(220,95%,76%)';

export function run() {
  const CX = window.innerWidth / 2;
  const CY = window.innerHeight / 2;

  // ── Initial reveal ────────────────────────────────────────────
  // Fade out the blackcover div and reveal vignette/scanlines.
  // startDelay gives a brief moment of pure black before anything draws.
  setTimeout(() => {
    $('blackcover').style.opacity = '0';
    $('vignette').style.opacity   = '1';
    $('scanlines').style.opacity  = '.6';
  }, D(0));

  setTimeout(() => flicker(0.05, 350), D(0));

  // ── PHASE 1: Vital.sandbox logo ───────────────────────────────
  const sbSeq = $('sandbox-seq');
  sbSeq.style.opacity = 0;
  setTimeout(() => { sbSeq.style.opacity = 1; }, D(0));

  const SB_DUR     = S(580);
  const SB_STAGGER = S(220);

  [['sA-out', 'sA-fill', 0],
   ['sB-out', 'sB-fill', SB_STAGGER],
   ['sC-out', 'sC-fill', SB_STAGGER * 2]
  ].forEach(([outId, fillId, delay]) => {
    const outEl = $(outId), fillEl = $(fillId);
    if (!outEl) return;
    outEl.style.opacity = 1;
    setTimeout(() => {
      outEl.style.transition = `stroke-dashoffset ${SB_DUR}ms cubic-bezier(.35,0,.2,1)`;
      outEl.style.strokeDashoffset = '0';
    }, D(delay));
    setTimeout(() => {
      outEl.style.transition = 'opacity 100ms ease';
      outEl.style.opacity = 0;
      fillEl.style.opacity = 1;
    }, D(delay + SB_DUR + 60));
  });

  const SB_DRAW_DONE = SB_STAGGER * 2 + SB_DUR + 60;

  setTimeout(() => { flicker(0.12, 80); setTimeout(() => flicker(0.06, 300), 150); }, D(S(400)));

  // Phase 1 resolve — flash + punch + logo scale
  setTimeout(() => {
    stop_flicker();
    setTimeout(() => {
      flash(0, '#fff');
      ripple(CX, CY, '#fff', 50,  360);
      ripple(CX, CY, BLUE,  120, 480);
      ripple(CX, CY, '#fff', 220, 600);
      burst(CX, CY, '#fff', 20, 50);
      burst(CX, CY, BLUE,   16, 80);
      const sLogo = $('sandbox-logo');
      sLogo.style.transition = 'transform 200ms cubic-bezier(.15,1.2,.3,1), filter 200ms ease';
      sLogo.style.transform  = 'scale(1.09)';
      sLogo.style.filter     = 'drop-shadow(0 0 60px var(--b60))';
      setTimeout(() => {
        sLogo.style.transition = 'transform 600ms cubic-bezier(.4,0,.2,1), filter 800ms ease';
        sLogo.style.transform  = 'scale(1)';
        sLogo.style.filter     = 'drop-shadow(0 0 20px var(--b30))';
        setTimeout(() => flicker(0.04, 450), 300);
      }, 200);
    }, 180);
  }, D(SB_DRAW_DONE));

  // Phase 1 exit — fade and shrink sandbox logo out
  const SB_EXIT = SB_DRAW_DONE + 200 + CONFIG.holdSandbox;
  setTimeout(() => {
    stop_flicker();
    setTimeout(() => {
      const sLogo = $('sandbox-logo');
      sLogo.style.transition = 'opacity 600ms cubic-bezier(.4,0,1,1), transform 600ms cubic-bezier(.4,0,1,1), filter 400ms ease';
      sLogo.style.opacity   = 0;
      sLogo.style.transform = 'scale(0.88)';
      sLogo.style.filter    = 'none';
    }, 120);
    setTimeout(() => {
      sbSeq.style.transition = 'opacity 400ms ease';
      sbSeq.style.opacity = 0;
    }, 280);
  }, D(SB_EXIT));

  // ── Suspense gap glitch ────────────────────────────────────────
  const GAP_START = SB_EXIT + 400;
  setTimeout(() => { flicker(0.18, 100); }, D(GAP_START));
  setTimeout(() => {
    stop_flicker(); flicker(0.08, 200);
    setTimeout(stop_flicker, 200);
  }, D(GAP_START + CONFIG.gapGlitch));

  // ── PHASE 2: Godot icon ───────────────────────────────────────
  const ICON_START = GAP_START + CONFIG.gapGlitch + 300;
  setTimeout(() => {
    flicker(0.06, 280);
    const gSeq = $('godot-seq');
    gSeq.style.opacity = 1;

    const gStrokes = [
      ['go-body',    S(900),    0],
      ['go-jaw',     S(400), S(500)],
      ['go-eyelout', S(300), S(680)],
      ['go-eyerout', S(300), S(780)],
      ['go-pupl',    S(180), S(920)],
      ['go-pupr',    S(180), S(1000)],
    ];

    gStrokes.forEach(([id, dur, delay]) => {
      const el = $(id); if (!el) return;
      el.style.opacity = 1;
      setTimeout(() => {
        el.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(.35,0,.2,1)`;
        el.style.strokeDashoffset = '0';
      }, delay);
    });

    const ICON_DRAW_DONE = S(1000) + S(180);

    setTimeout(() => { flicker(0.12, 80); setTimeout(() => flicker(0.06, 300), 150); }, S(550));

    // Phase 2 resolve — flash + fill strokes with solid fills
    setTimeout(() => {
      stop_flicker();
      setTimeout(() => {
        flash(0, '#fff');
        ripple(CX, CY, BLUE, 60,  340);
        ripple(CX, CY, BLUE, 160, 500);
        burst(CX, CY, BLUE, 32, 60);

        gStrokes.forEach(([id]) => {
          const e = $(id);
          if (e) { e.style.transition = 'opacity 80ms ease'; e.style.opacity = 0; }
        });

        ['gf-body', 'gf-jaw', 'gf-eyelw2', 'gf-eyerw2', 'gf-pupl2', 'gf-pupr2', 'gf-shinl', 'gf-shinr']
          .forEach(id => { const e = $(id); if (e) e.style.opacity = 1; });

        const logo = $('godot-logo');
        logo.style.transition = 'transform 180ms cubic-bezier(.15,1.2,.3,1), filter 180ms ease';
        logo.style.transform  = 'scale(1.10)';
        logo.style.filter     = `drop-shadow(0 0 50px ${BLUE})`;
        setTimeout(() => {
          logo.style.transition = 'transform 500ms cubic-bezier(.4,0,.2,1), filter 600ms ease';
          logo.style.transform  = 'scale(1)';
          logo.style.filter     = 'drop-shadow(0 0 18px var(--b40))';
          setTimeout(() => flicker(0.05, 380), 200);
        }, 180);
      }, 160);
    }, ICON_DRAW_DONE);

    // Final fade — bring curtain to full black, then notify C++ we're done.
    // C++ destroys the webview on receiving { action: "done" }.
    setTimeout(() => {
      stop_flicker();
      setTimeout(() => {
        const curtain = $('curtain');
        curtain.style.transition = `opacity ${CONFIG.fadeOut}ms cubic-bezier(.4,0,.6,1)`;
        curtain.style.opacity = 1;
      }, 160);
    }, ICON_DRAW_DONE + 200 + CONFIG.holdIcon);

    // Post "done" after the curtain fade completes.
    // main.js owns all ipc.postMessage calls; animation just exports run().
    const TOTAL_DONE = ICON_DRAW_DONE + 200 + CONFIG.holdIcon + 160 + CONFIG.fadeOut + 100;
    setTimeout(() => {
      window.dispatchEvent(new Event('splash-done'));
    }, TOTAL_DONE);

  }, D(ICON_START));
}
