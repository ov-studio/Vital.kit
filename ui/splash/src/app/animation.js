import * as config   from './config.js';
import * as effects  from './effects.js';

const D = (t) => config.START_DELAY + t;
const S = (ms) => Math.round(ms * config.STROKE_SPEED);
const $ = (id) => document.getElementById(id);

let _hasRun = false;

export function run() {
  if (_hasRun) return;
  _hasRun = true;

  const CX = window.innerWidth / 2;
  const CY = window.innerHeight / 2;
  const brand = $('vital-brand');

  // ── Lights up: black cover lifts, brand appears ──
  setTimeout(() => {
    $('blackcover').style.opacity = '0';
    $('scanlines').style.opacity = '.6';
    brand.style.opacity = 1;
  }, D(0));

  // ── Logo outline draws in, polygon by polygon, each filling as it lands ──
  const DRAW_DUR = S(580);
  const STAGGER = S(220);

  [['sA', 0], ['sB', STAGGER], ['sC', STAGGER * 2]].forEach(([id, delay]) => {
    const outline = $(`${id}-out`), fill = $(`${id}-fill`);
    setTimeout(() => {
      outline.style.transition = `stroke-dashoffset ${DRAW_DUR}ms cubic-bezier(.35,0,.2,1)`;
      outline.style.strokeDashoffset = '0';
    }, D(delay));
    setTimeout(() => {
      outline.style.transition = 'opacity 100ms ease';
      outline.style.opacity = 0;
      fill.style.opacity = 1;
    }, D(delay + DRAW_DUR + 60));
  });

  const DRAW_DONE = STAGGER * 2 + DRAW_DUR + 60;

  // Neon tube warming up mid-draw
  setTimeout(() => effects.glitch(brand, 2), D(S(400)));

  // ── Resolve: final stutter, then ignite (flash, ripples, punch) ──
  setTimeout(async () => {
    await effects.glitch(brand, 2);

    effects.flash(0, '#fff');
    effects.ripple(CX, CY, '#fff', 50, 360);
    effects.ripple(CX, CY, 'var(--blue)', 120, 480);
    effects.ripple(CX, CY, '#fff', 220, 600);

    brand.style.transition = 'transform 200ms cubic-bezier(.15,1.2,.3,1)';
    brand.style.transform = 'scale(1.09)';
    setTimeout(() => {
      brand.style.transition = 'transform 600ms cubic-bezier(.4,0,.2,1)';
      brand.style.transform = 'scale(1)';
      effects.idle_flicker(brand);
    }, 200);
  }, D(DRAW_DONE));

  // ── Exit:
  //   0. Tell C++ to show mainmenu fullscreen under the splash (before fade).
  //   1. Curtain fades in to black; logo + scene fade out.
  //   2. Hold on solid black, then dissolve — mainmenu is already underneath.
  const EXIT_AT = DRAW_DONE + 200 + config.HOLD_VITAL;

  setTimeout(() => {
    effects.stop_flicker(brand);
    window.dispatchEvent(new Event('splash:prehide'));
    setTimeout(() => {
      const curtain = $('curtain');
      const fadeDur = config.FADE_TO_BLACK;
      curtain.style.transition = `opacity ${fadeDur}ms cubic-bezier(.4,0,.6,1)`;
      curtain.style.opacity = 1;
      [$('scene'), $('scanlines')].forEach((el) => {
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
  }, D(EXIT_AT));

  const TOTAL_DONE = EXIT_AT + 160 + config.FADE_TO_BLACK + config.BLACK_HOLD_DELAY + config.FADE_TO_TRANSPARENT + 100;
  setTimeout(() => {
    window.dispatchEvent(new Event('splash:hide'));
  }, D(TOTAL_DONE));
}
