// Hides an <img> whose source failed to load (placeholder art, offline, etc).
export const hideBroken = e => { e.target.style.opacity = '0'; };
