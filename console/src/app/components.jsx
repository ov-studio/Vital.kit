import * as react    from 'react';
import * as app_util from './util';

export const FilterButton = ({ type, label, count, is_active, on_click, color, bg_alpha, border_alpha }) => (
  <div
    className={`filter ${is_active ? 'active' : ''}`}
    data-type={type}
    onClick={on_click}
    style={app_util.color_style(color, { bg_alpha, border_alpha })}
  >
    <div className="filter-dot"></div>
    {label}
    {count > 0 && <span className="filter-count"> ({count})</span>}
  </div>
);

export const ActionButton = ({ icon: Icon, label, on_click }) => (
  <button className="action-btn" onClick={on_click}>
    <Icon size={13} strokeWidth={2.6}/>
  </button>
);

export const LogText = ({ text, color }) => {
  const segments = app_util.parse_segments(text);
  const lightened = color ? rgb_lighten(color, 0.4) : null;
  const code_style = app_util.color_style(lightened, { bg_alpha: 0.025, border_alpha: 0.3 });
  return segments.map((seg, i) => {
    if (!seg.is_code) return <react.default.Fragment key={i}>{seg.text}</react.default.Fragment>;
    const is_multiline = seg.text.includes('\n');
    return is_multiline
      ? <pre key={i} className="code-pill log-code log-code-block" style={code_style}>{seg.text}</pre>
      : <code key={i} className="code-pill log-code" style={code_style}>{seg.text}</code>;
  });
};

export const LogRow = ({ type, badge, color, timestamp, message, repeat_count, is_hidden }) => {
  const lines = app_util.parse_lines(message);
  const is_multiline = lines.length > 1;
  return (
    <div
      className={`log-row ${type} ${is_hidden ? 'hidden' : ''} ${is_multiline ? 'log-row-multiline' : ''}`}
      style={{ color: rgb_to_css(rgb_lighten(color, 0.05)) }}
    >
      <span className="log-ts">{timestamp}</span>
      <span className="log-level" style={{ color: rgb_to_css(color) }}>{badge}</span>
      <div className="log-msg">
        {lines.map((line, i) => (
          <div key={i} className={line.is_quote ? 'log-line log-quote' : 'log-line'}>
            <LogText text={line.text} color={color}/>
          </div>
        ))}
      </div>
      {repeat_count > 1 && (
        <span className="badge">
          x{repeat_count}
        </span>
      )}
    </div>
  );
};