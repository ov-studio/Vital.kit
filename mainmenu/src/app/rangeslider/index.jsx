import './index.css';

/* Percent slider with a live readout. The filled part of the track follows --fill. */
export function RangeSlider({ label, value, onChange, min = 1, max = 100 }) {
  return (
    <div className="rslider">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        value={value}
        style={{ '--fill': `${((value - min) / (max - min)) * 100}%` }}
        onChange={e => onChange(Number(e.target.value))}
      />
      <span className="rslider-value">{value}%</span>
    </div>
  );
}
