import { useState, useEffect } from 'react';

/* Remote server art (logo / banner). Renders the image when there is one and it loads;
   otherwise a plain element carrying the same class, so the CSS background colour is the fallback. */
export function Pic({ src, className, children }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [src]);
  if (!src || bad) return <div className={className}>{children}</div>;
  return <img className={className} src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} />;
}
