import './index.css';

/* Name + description on the left, the control on the right. Lives inside a ui/panel. */
export function SettingRow({ name, desc, children }) {
  return (
    <div className="setting-row">
      <div>
        <div className="setting-name">{name}</div>
        <div className="setting-desc">{desc}</div>
      </div>
      <div className="setting-control">{children}</div>
    </div>
  );
}
