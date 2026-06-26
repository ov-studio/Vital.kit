import React from 'react';
import { rgb_to_css, rgb_to_css_alpha, rgb_lighten, parse_lines, parse_segments } from './godot-bridge.js';

export const TrashIcon = ({ size = 24, strokeWidth = 2, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const RotateIcon = ({ size = 24, strokeWidth = 2, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
  </svg>
);

export const FilterButton = ({ type, label, count, is_active, on_click, color }) => (
  <div
    className={`filter ${is_active ? 'active' : ''}`}
    data-type={type}
    onClick={on_click}
    style={color ? { color: rgb_to_css(color), backgroundColor: rgb_to_css_alpha(color, 0.1) } : {}}
  >
    <div className="filter-dot"></div>
    {label}
    {count > 0 && <span className="filter-count"> ({count})</span>}
  </div>
);

export const ActionButton = ({ icon: Icon, label, on_click }) => (
  <button className="icon-btn icon-btn-labeled" onClick={on_click}>
    <Icon size={12} strokeWidth={2} />
    <span className="btn-label">{label}</span>
  </button>
);

export const LogText = ({ text, color }) => {
  const segments = parse_segments(text);
  const lightened = color ? rgb_lighten(color, 0.4) : null;
  return segments.map((seg, i) =>
    seg.is_code
      ? <code key={i} className="log-code" style={lightened ? {
        color: rgb_to_css(lightened),
        background: rgb_to_css_alpha(lightened, 0.025),
        borderColor: rgb_to_css_alpha(lightened, 0.3),
      } : {}}>{seg.text}</code>
      : <React.Fragment key={i}>{seg.text}</React.Fragment>
  );
};

export const LogRow = ({ type, badge, color, timestamp, message, repeat_count, is_hidden }) => {
  const lines = parse_lines(message);
  const is_multiline = lines.length > 1;
  return (
    <div
      className={`log-row ${type} ${is_hidden ? 'hidden' : ''} ${is_multiline ? 'log-row-multiline' : ''}`}
      style={{ color: rgb_to_css(rgb_lighten(color, 0.05)) }}
    >
      <span className="log-ts">{timestamp}</span>
      <span className="log-level" style={{ color: rgb_to_css(color) }}>{badge}</span>
      <span className="log-msg">
        {lines.map((line, i) => (
          <span key={i} className={line.is_quote ? 'log-line log-quote' : 'log-line'}>
            <LogText text={line.text} color={color} />
          </span>
        ))}
      </span>
      {repeat_count > 1 && <span className="badge visible">x{repeat_count}</span>}
    </div>
  );
};
