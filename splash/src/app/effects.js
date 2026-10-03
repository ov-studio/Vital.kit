const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (min, max) => min + Math.random() * (max - min);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Bumped by stop_flicker() so any glitch still in flight bails out instead of
// re-applying the glitch state after we've asked for it to stop.
let _epoch = 0;

// Neon-sign stutter: toggles the brand's `is-glitch` state (styled by
// cdn/ui/brand, same as the site hero) in short random bursts.
export async function glitch(brand, bursts = 2) {
  if (reduced) return;
  const epoch = _epoch;
  for (let i = 0; i < bursts; i++) {
    brand.classList.add('is-glitch');
    await wait(rand(40, 110));
    if (epoch !== _epoch) return;
    brand.classList.remove('is-glitch');
    await wait(rand(50, 140));
    if (epoch !== _epoch) return;
  }
}

// Occasional stutter while the lit logo is on screen. Call stop_flicker() to end it.
export function idle_flicker(brand) {
  const epoch = _epoch;
  (async function loop() {
    await wait(rand(700, 1600));
    if (epoch !== _epoch) return;
    await glitch(brand, Math.random() < 0.5 ? 1 : 2);
    if (epoch === _epoch) loop();
  })();
}

export function stop_flicker(brand) {
  _epoch++;
  brand.classList.remove('is-glitch');
}

export function flash(delay, color = '#fff') {
  const f = document.getElementById('flash');
  setTimeout(() => {
    f.style.background = color;
    f.style.transition = 'opacity 40ms ease';
    f.style.opacity = 1;
    setTimeout(() => { f.style.transition = 'opacity 600ms ease'; f.style.opacity = 0; }, 45);
  }, delay);
}

export function ripple(cx, cy, color, delay, size = 320) {
  setTimeout(() => {
    const r = document.createElement('div');
    r.className = 'ripple';
    Object.assign(r.style, {
      width: size + 'px', height: size + 'px',
      left: cx - size / 2 + 'px', top: cy - size / 2 + 'px',
      borderColor: color, borderWidth: '1.5px'
    });
    document.body.appendChild(r);
    requestAnimationFrame(() => {
      r.style.transition = 'transform 1000ms cubic-bezier(.15,0,.5,1), opacity 1000ms ease';
      r.style.transform = 'scale(2.6)';
      r.style.opacity = 0;
    });
    setTimeout(() => r.remove(), 1100);
  }, delay);
}
