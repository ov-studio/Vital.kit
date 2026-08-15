import * as config   from './config.js';
import * as effects  from './effects.js';

const D = (t) => config.START_DELAY + t;
const S = (ms) => Math.round(ms * config.STROKE_SPEED);
const $ = (id) => document.getElementById(id);
const BLUE = 'hsl(220,95%,76%)';

let _hasRun = false;

export function run() {
  if (_hasRun) return;
  _hasRun = true;

  const CX = window.innerWidth / 2;
  const CY = window.innerHeight / 2;

  setTimeout(() => {
    $('blackcover').style.opacity = '0';
    $('vignette').style.opacity = '1';
    $('scanlines').style.opacity = '.6';
  }, D(0));

  setTimeout(() => effects.flicker(0.05, 350), D(0));

  // ── PHASE 1: Vital.sandbox logo ───────────────────────────────
  const sbSeq = $('sandbox-seq');
  sbSeq.style.opacity = 0;
  setTimeout(() => { sbSeq.style.opacity = 1; }, D(0));

  const SB_DUR = S(580);
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

  setTimeout(() => { effects.flicker(0.12, 80); setTimeout(() => effects.flicker(0.06, 300), 150); }, D(S(400)));

  // Phase 1 resolve — flash + punch + logo scale
  setTimeout(() => {
    effects.stop_flicker();
    setTimeout(() => {
      effects.flash(0, '#fff');
      effects.ripple(CX, CY, '#fff', 50, 360);
      effects.ripple(CX, CY, BLUE, 120, 480);
      effects.ripple(CX, CY, '#fff', 220, 600);
      effects.burst(CX, CY, '#fff', 20, 50);
      effects.burst(CX, CY, BLUE, 16, 80);
      const sLogo = $('sandbox-logo');
      sLogo.style.transition = 'transform 200ms cubic-bezier(.15,1.2,.3,1), filter 200ms ease';
      sLogo.style.transform = 'scale(1.09)';
      sLogo.style.filter = 'drop-shadow(0 0 60px var(--b60))';
      setTimeout(() => {
        sLogo.style.transition = 'transform 600ms cubic-bezier(.4,0,.2,1), filter 800ms ease';
        sLogo.style.transform = 'scale(1)';
        sLogo.style.filter = 'drop-shadow(0 0 20px var(--b30))';
        setTimeout(() => effects.flicker(0.04, 450), 300);
      }, 200);
    }, 180);
  }, D(SB_DRAW_DONE));

  // Phase 1 exit — fade and shrink sandbox logo out
  const SB_EXIT = SB_DRAW_DONE + 200 + config.HOLD_SANDBOX;
  setTimeout(() => {
    effects.stop_flicker();
    setTimeout(() => {
      const sLogo = $('sandbox-logo');
      sLogo.style.transition = 'opacity 600ms cubic-bezier(.4,0,1,1), transform 600ms cubic-bezier(.4,0,1,1), filter 400ms ease';
      sLogo.style.opacity = 0;
      sLogo.style.transform = 'scale(0.88)';
      sLogo.style.filter = 'none';
    }, 120);
    setTimeout(() => {
      sbSeq.style.transition = 'opacity 400ms ease';
      sbSeq.style.opacity = 0;
    }, 280);
  }, D(SB_EXIT));

  // ── Suspense gap glitch ────────────────────────────────────────
  const GAP_START = SB_EXIT + 400;
  setTimeout(() => { effects.flicker(0.18, 100); }, D(GAP_START));
  setTimeout(() => {
    effects.stop_flicker(); effects.flicker(0.08, 200);
    setTimeout(effects.stop_flicker, 200);
  }, D(GAP_START + config.GAP_GLITCH));

  // ── PHASE 2: Godot icon ───────────────────────────────────────
  const ICON_START = GAP_START + config.GAP_GLITCH + 300;
  setTimeout(() => {
    effects.flicker(0.06, 280);
    const gSeq = $('godot-seq');
    gSeq.style.opacity = 1;

    const gStrokes = [
      ['go-body',    S(900), 0],
      ['go-jaw',     S(700), S(500)],
      ['go-eyelout', S(300), S(680)],
      ['go-eyerout', S(300), S(780)],
      ['go-pupl',    S(180), S(920)],
      ['go-pupr',    S(180), S(1000)],
    ];

    gStrokes.forEach(([id, dur, delay]) => {
      const el = $(id); if (!el) return;
      const rawLen = el.style.getPropertyValue('--len').trim() || '3000px';
      const lenNum = parseFloat(rawLen);
      el.style.setProperty('stroke-dasharray', lenNum);
      el.style.setProperty('stroke-dashoffset', lenNum);
      el.style.opacity = 1;
      setTimeout(() => {
        el.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(.35,0,.2,1)`;
        el.style.setProperty('stroke-dashoffset', '0');
      }, delay);
    });

    const ICON_DRAW_DONE = S(1000) + S(180);

    setTimeout(() => { effects.flicker(0.12, 80); setTimeout(() => effects.flicker(0.06, 300), 150); }, S(550));

    // Phase 2 resolve — flash + fill strokes with solid fills
    setTimeout(() => {
      effects.stop_flicker();
      setTimeout(() => {
        effects.flash(0, '#fff');
        effects.ripple(CX, CY, BLUE, 60, 340);
        effects.ripple(CX, CY, BLUE, 160, 500);
        effects.burst(CX, CY, BLUE, 32, 60);

        gStrokes.forEach(([id]) => {
          const e = $(id);
          if (e) {
            e.style.transition = 'opacity 80ms ease';
            e.style.opacity = 0;
          }
        });

        ['gf-body', 'gf-jaw', 'gf-eyelw2', 'gf-eyerw2', 'gf-pupl2', 'gf-pupr2', 'gf-shinl', 'gf-shinr'].forEach(id => {
          const e = $(id);
          if (e) e.style.opacity = 1;
        });

        const logo = $('godot-logo');
        logo.style.transition = 'transform 180ms cubic-bezier(.15,1.2,.3,1), filter 180ms ease';
        logo.style.transform = 'scale(1.10)';
        logo.style.filter = `drop-shadow(0 0 50px ${BLUE})`;
        setTimeout(() => {
          logo.style.transition = 'transform 500ms cubic-bezier(.4,0,.2,1), filter 600ms ease';
          logo.style.transform = 'scale(1)';
          logo.style.filter = 'drop-shadow(0 0 18px var(--b40))';
          setTimeout(() => effects.flicker(0.05, 380), 200);
        }, 180);
      }, 160);
    }, ICON_DRAW_DONE);

    // Exit — three stages:
    //   1. Curtain fades in to black; logo + scene fade out simultaneously.
    //   2. Hold on solid black (BLACK_HOLD_DELAY).
    //   3. Curtain fades to transparent, revealing Vital.sandbox behind.
    setTimeout(() => {
      effects.stop_flicker();
      setTimeout(() => {
        const curtain = $('curtain');
        const fadeDur = config.FADE_TO_BLACK;
        curtain.style.transition = `opacity ${fadeDur}ms cubic-bezier(.4,0,.6,1)`;
        curtain.style.opacity = 1;
        const sceneLayers = [$('godot-logo'), gSeq, $('vignette'), $('scanlines')].filter(Boolean);
        sceneLayers.forEach((el) => {
          el.style.transition = `opacity ${fadeDur}ms cubic-bezier(.4,0,.6,1)`;
          el.style.opacity = 0;
        });

        setTimeout(() => {
          document.documentElement.style.background = 'transparent';
          document.body.style.background = 'transparent';
          curtain.style.transition = `opacity ${config.FADE_TO_TRANSPARENT}ms cubic-bezier(.4,0,.6,1)`;
          void curtain.offsetHeight;
          curtain.style.opacity = 0;
        }, fadeDur + config.BLACK_HOLD_DELAY);
      }, 160);
    }, ICON_DRAW_DONE + 200 + config.HOLD_ICON);

    const TOTAL_DONE = ICON_DRAW_DONE + 200 + config.HOLD_ICON + 160 + config.FADE_TO_BLACK + config.BLACK_HOLD_DELAY + config.FADE_TO_TRANSPARENT + 100;
    setTimeout(() => {
      window.dispatchEvent(new Event('splash:hide'));
    }, TOTAL_DONE);
  }, D(ICON_START));
}