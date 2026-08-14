// Reusable visual effect helpers — flash, ripple, burst, flicker.

const flickEl = () => document.getElementById('flicker');
let _flickIv = null;

export function flicker(intensity, intervalMs) {
  stop_flicker();
  const el = flickEl();
  _flickIv = setInterval(() => {
    const r = Math.random();
    if (r < 0.38) {
      el.style.transition = 'opacity 12ms linear';
      el.style.opacity = (Math.random() * intensity).toFixed(3);
      setTimeout(() => { el.style.transition = 'opacity 30ms linear'; el.style.opacity = 0; }, 16);
    }
    else if (r < 0.55) {
      el.style.opacity = (Math.random() * intensity).toFixed(3);
      setTimeout(() => {
        el.style.opacity = 0;
        setTimeout(() => {
          el.style.opacity = (Math.random() * intensity * 0.5).toFixed(3);
          setTimeout(() => { el.style.opacity = 0; }, 22);
        }, 28);
      }, 14);
    }
  }, intervalMs);
}

export function stop_flicker() {
  if (_flickIv) { clearInterval(_flickIv); _flickIv = null; }
  flickEl().style.opacity = 0;
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

export function burst(cx, cy, color, n, delay) {
  setTimeout(() => {
    for (let i = 0; i < n; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `background:${color};left:${cx}px;top:${cy}px;width:${2 + Math.random() * 3}px;height:${2 + Math.random() * 3}px`;
      document.body.appendChild(p);
      const a = Math.random() * Math.PI * 2;
      const d = 50 + Math.random() * 180;
      const dur = 700 + Math.random() * 600;
      requestAnimationFrame(() => {
        p.style.transition = `transform ${dur}ms cubic-bezier(.15,.8,.3,1), opacity ${dur}ms ease`;
        p.style.transform = `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(0)`;
        p.style.opacity = 0;
      });
      setTimeout(() => p.remove(), dur + 50);
    }
  }, delay);
}
