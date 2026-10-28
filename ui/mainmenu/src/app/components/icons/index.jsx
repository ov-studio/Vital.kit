// Lucide-only icon helpers for the main menu.
//
// <Label> renders an icon + text pair that is optically centred on the same
// horizontal axis. SVGs are forced to display:block (no baseline gap) and the
// text is trimmed to cap height, so uppercase / mixed-case labels both centre
// on the icon. Tweak --btn-ic-nudge in index.css if a font needs a 1px nudge.
export function Label({ icon: Icon, after: After, size = 12, strokeWidth = 2.2, fill, children }) {
  const props = { size, strokeWidth, fill, className: 'btn-ic', 'aria-hidden': true };
  return (
    <>
      {Icon && <Icon {...props} />}
      <span className="btn-txt">{children}</span>
      {After && <After {...props} />}
    </>
  );
}
