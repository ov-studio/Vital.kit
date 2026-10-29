export function Empty({ icon: Icon, className = '', children }) {
  return (
    <div className={`app-empty ${className}`.trim()}>
      {Icon && <Icon size={22} strokeWidth={2}/>}
      <span>{children}</span>
    </div>
  );
}
