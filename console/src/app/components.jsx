import * as react from 'react';
import * as app_bridge from './bridge';

export const FilterButton = ({ type, label, count, is_active, on_click, color }) => (
  <div
    className={`filter ${is_active ? 'active' : ''}`}
    data-type={type}
    onClick={on_click}
    style={color ? { color: app_bridge.rgb_to_css(color), backgroundColor: app_bridge.rgb_to_css_alpha(color, 0.1) } : {}}
  >
    <div className="filter-dot"></div>
    {label}
    {count > 0 && <span className="filter-count"> ({count})</span>}
  </div>
);

export const ActionButton = ({ icon: Icon, label, on_click }) => (
  <button className="icon-btn" onClick={on_click}>
    <Icon size={13} strokeWidth={3}/>
  </button>
);

export const LogText = ({ text, color }) => {
  const segments = app_bridge.parse_segments(text);
  const lightened = color ? app_bridge.rgb_lighten(color, 0.4) : null;
  return segments.map((seg, i) =>
    seg.is_code
      ? <code key={i} className="log-code" style={lightened ? {
        color: app_bridge.rgb_to_css(lightened),
        background: app_bridge.rgb_to_css_alpha(lightened, 0.025),
        borderColor: app_bridge.rgb_to_css_alpha(lightened, 0.3),
      } : {}}>{seg.text}</code>
      : <react.default.Fragment key={i}>{seg.text}</react.default.Fragment>
  );
};

export const LogRow = ({ type, badge, color, timestamp, message, repeat_count, is_hidden }) => {
  const lines = app_bridge.parse_lines(message);
  const is_multiline = lines.length > 1;
  return (
    <div
      className={`log-row ${type} ${is_hidden ? 'hidden' : ''} ${is_multiline ? 'log-row-multiline' : ''}`}
      style={{ color: app_bridge.rgb_to_css(app_bridge.rgb_lighten(color, 0.05)) }}
    >
      <span className="log-ts">{timestamp}</span>
      <span className="log-level" style={{ color: app_bridge.rgb_to_css(color) }}>{badge}</span>
      <span className="log-msg">
        {lines.map((line, i) => (
          <span key={i} className={line.is_quote ? 'log-line log-quote' : 'log-line'}>
            <LogText text={line.text} color={color}/>
          </span>
        ))}
      </span>
      {repeat_count > 1 && (
        <span className="badge">
          x{repeat_count}
        </span>
      )}
    </div>
  );
};