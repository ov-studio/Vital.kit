import * as react from 'react';
import * as lucide from 'lucide-react';
import * as app_config from './config';
import * as app_util from './util';
import * as app_components from './components';

export const Console = () => {
  const [logs, set_logs] = react.useState([]);
  const [seed_meta, set_seed_meta] = react.useState({});
  const [command_input, set_command_input] = react.useState('');
  const [is_dragging, set_is_dragging] = react.useState(false);
  const [command_history, set_command_history] = react.useState([]);
  const [history_index, set_history_index] = react.useState(-1);
  const [temp_input, set_temp_input] = react.useState('');
  const [position, set_position] = react.useState(app_config.DEFAULT_POSITION);
  const [bind_key, set_bind_key] = react.useState(null);
  const [size, set_size] = react.useState({ width: '800px', height: '360px' });

  const console_ref = react.useRef(null);
  const log_body_ref = react.useRef(null);
  const input_ref = react.useRef(null);
  const group_map_ref = react.useRef(new Map());
  const drag_offset_ref = react.useRef({ x: 0, y: 0 });
  const seed_meta_ref = react.useRef(seed_meta);
  const level_types_ref = react.useRef([]);
  const pinned_ref = react.useRef(true);
  const last_scroll_top_ref = react.useRef(0);
  const scroll_idle_ref = react.useRef(null);
  const raf_ref = react.useRef(null);

  const level_meta = react.useMemo(() => {
    const map = { ...seed_meta };
    logs.forEach(l => {
      if (!map[l.type]) map[l.type] = {
        label: l.label,
        badge: l.badge,
        color: l.color,
        background: l.background,
        priority: l.priority
      };
    });
    return map;
  }, [logs, seed_meta]);

  const level_types = react.useMemo(() => {
    const result = [...new Set([...Object.keys(seed_meta), ...logs.map(l => l.type)])].sort((a, b) => (level_meta[a]?.priority ?? 99) - (level_meta[b]?.priority ?? 99));
    level_types_ref.current = result;
    return result;
  }, [logs, level_meta, seed_meta]);

  const deactivated_ref = react.useRef(new Set());

  const active_filters = react.useMemo(() => {
    const result = new Set();
    level_types_ref.current.forEach(t => {
      if (!deactivated_ref.current.has(t)) result.add(t);
    });
    return result;
  }, [logs, seed_meta]);

  const log_counts = react.useMemo(() => {
    const counts = Object.fromEntries(level_types.map(t => [t, 0]));
    logs.forEach(log => { if (counts[log.type] !== undefined) counts[log.type]++; });
    return counts;
  }, [logs, level_types]);

  const total_count = react.useMemo(() => Object.values(log_counts).reduce((s, c) => s + c, 0), [log_counts]);

  const handle_scroll = react.useCallback(() => {
    const el = log_body_ref.current;
    if (!el) return;

    if (el.scrollTop < last_scroll_top_ref.current) pinned_ref.current = false;
    last_scroll_top_ref.current = el.scrollTop;
    clearTimeout(scroll_idle_ref.current);
    scroll_idle_ref.current = setTimeout(() => {
      const near_bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
      if (near_bottom) pinned_ref.current = true;
    }, 150);
  }, []);

  const handle_log_mousedown = react.useCallback((e) => {
    const el = log_body_ref.current;
    if (!el) return;

    const scrollbar_width = el.offsetWidth - el.clientWidth;
    const rect = el.getBoundingClientRect();
    const clicked_scrollbar = scrollbar_width > 0 && e.clientX >= rect.right - scrollbar_width;
    if (e.button === 1 || clicked_scrollbar) pinned_ref.current = false;
  }, []);

  const add_log = react.useCallback((entry, meta) => {
    if (!entry.mode || !entry.message) return;
    const resolved = meta?.[entry.mode];
    if (!resolved) return;

    const ts = entry.timestamp || new Date().toTimeString().slice(0, 8);
    const now = Date.now();
    const key = make_key(entry.mode, entry.message);
    for (const [k, e] of group_map_ref.current)
      if (now >= e.expires_at) group_map_ref.current.delete(k);

    const existing = group_map_ref.current.get(key);
    if (existing) {
      existing.count++;
      existing.expires_at = now + app_config.LOG_DEBOUNCE;
      existing.timestamp = ts;
      set_logs(prev => prev.map(log =>
        log.id === existing.id ? { ...log, repeat_count: existing.count, timestamp: ts } : log
      ));
    }
    else {
      const new_log = {
        id: Date.now() + Math.random(),
        type: entry.mode,
        message: entry.message,
        timestamp: ts,
        repeat_count: 1
      };
      group_map_ref.current.set(key, { id: new_log.id, count: 1, expires_at: now + app_config.LOG_DEBOUNCE, timestamp: ts });
      set_logs(prev => {
        const updated = [...prev, new_log];
        if (updated.length > app_config.LOG_LIMIT) return updated.slice(updated.length - app_config.LOG_LIMIT);
        return updated;
      });
    }
  }, []);

  const clear_logs = react.useCallback(() => {
    set_logs([]);
    group_map_ref.current.clear();
    ipc.postMessage(JSON.stringify({ action: 'clear' }));
  }, []);

  const handle_message = react.useCallback((e) => {
    const data = JSON.parse(e.detail);
    if (data.action === 'init') { set_seed_meta(data.types); if (data.bind) set_bind_key(godot_to_key(data.bind)); }
    else if (data.action === 'print') add_log(data, seed_meta_ref.current);
    else if (data.action === 'clear') clear_logs();
  }, [add_log, clear_logs]);

  const handle_command = react.useCallback((command) => {
    const message = command.trim();
    if (!message) return;
    
    set_command_history(prev => prev[prev.length - 1] !== message ? [...prev, message] : prev);
    set_history_index(-1);
    set_temp_input('');
    ipc.postMessage(JSON.stringify({ action: 'input', message }));
  }, []);

  const handle_key_down = react.useCallback((e) => {
    if (bind_key && e.key === bind_key) {
      e.preventDefault();
      ipc.postMessage(JSON.stringify({ action: 'toggle' }));
      return;
    }
    if (document.activeElement !== input_ref.current) return;

    if (e.key === 'Enter' && command_input.trim()) {
      handle_command(command_input);
      set_command_input('');
    }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!command_history.length) return;
      if (history_index === -1) set_temp_input(command_input);
      const idx = history_index === -1 ? command_history.length - 1 : Math.max(0, history_index - 1);
      set_history_index(idx);
      set_command_input(command_history[idx]);
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history_index === -1) return;
      const idx = history_index + 1;
      if (idx >= command_history.length) { set_history_index(-1); set_command_input(temp_input); }
      else { set_history_index(idx); set_command_input(command_history[idx]); }
    }
  }, [command_input, command_history, history_index, temp_input, handle_command, bind_key]);

  const [, force_update] = react.useReducer(x => x + 1, 0);

  const toggle_filter = react.useCallback((type) => {
    if (type === 'all') {
      const all_active = level_types_ref.current.every(t => !deactivated_ref.current.has(t));
      if (all_active) level_types_ref.current.forEach(t => deactivated_ref.current.add(t));
      else deactivated_ref.current.clear();
    }
    else {
      if (deactivated_ref.current.has(type)) deactivated_ref.current.delete(type);
      else deactivated_ref.current.add(type);
    }
    force_update();
  }, []);

  const handle_mouse_down = react.useCallback((e) => {
    if (e.target.closest('.action-btn, .filter')) return;

    e.preventDefault();
    set_is_dragging(true);
    const rect = console_ref.current.getBoundingClientRect();
    drag_offset_ref.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handle_mouse_move = react.useCallback((e) => {
    if (!is_dragging) return;

    set_position({ x: e.clientX - drag_offset_ref.current.x, y: e.clientY - drag_offset_ref.current.y });
  }, [is_dragging]);

  const handle_mouse_up = react.useCallback(() => set_is_dragging(false), []);

  const handle_resize_start = react.useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    const { clientX: sx, clientY: sy } = e;
    const { width: sw, height: sh } = console_ref.current.getBoundingClientRect();
    const on_move = (e) => set_size({ width: Math.max(400, sw + e.clientX - sx) + 'px', height: Math.max(260, sh + e.clientY - sy) + 'px' });
    const on_end = () => { document.removeEventListener('mousemove', on_move); document.removeEventListener('mouseup', on_end); };
    document.addEventListener('mousemove', on_move);
    document.addEventListener('mouseup', on_end);
  }, []);

  react.useEffect(() => { seed_meta_ref.current = seed_meta; }, [seed_meta]);

  react.useEffect(() => {
    const tick = () => {
      const el = log_body_ref.current;
      if (el && pinned_ref.current) el.scrollTop = el.scrollHeight;
      raf_ref.current = requestAnimationFrame(tick);
    };
    raf_ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf_ref.current);
  }, []);

  react.useEffect(() => {
    const prevent = (e) => e.preventDefault();
    document.addEventListener('contextmenu', prevent);
    return () => document.removeEventListener('contextmenu', prevent);
  }, []);

  react.useEffect(() => {
    if (!is_dragging) return;

    document.addEventListener('mousemove', handle_mouse_move);
    document.addEventListener('mouseup', handle_mouse_up);
    return () => { document.removeEventListener('mousemove', handle_mouse_move); document.removeEventListener('mouseup', handle_mouse_up); };
  }, [is_dragging, handle_mouse_move, handle_mouse_up]);

  react.useEffect(() => {
    document.addEventListener('message', handle_message);
    return () => document.removeEventListener('message', handle_message);
  }, [handle_message]);

  // dev-only: signals the test harness (see main.jsx) that it's safe to send
  // fake events now that the 'message' listener is attached. Fires once on
  // mount. Harmless in production - nothing listens for it inside Godot.
  react.useEffect(() => {
    window.dispatchEvent(new Event('console-mounted'));
  }, []);

  react.useEffect(() => {
    document.addEventListener('keydown', handle_key_down);
    return () => document.removeEventListener('keydown', handle_key_down);
  }, [handle_key_down]);

  react.useEffect(() => {
    ipc.postMessage(JSON.stringify({ action: 'ready' }));
  }, []);

  return (
    <div ref={console_ref} className="console" style={{ left: `${position.x}px`, top: `${position.y}px`, width: size.width, height: size.height }}>
      <div className={`header ${is_dragging ? 'dragging' : ''}`} onMouseDown={handle_mouse_down}>
        <span className="titlebar-label">Console</span>
        <div className="header-divider"></div>
        <div className="filters">
          <app_components.FilterButton type="all" label="All" count={total_count} is_active={active_filters.size === level_types.length} on_click={() => toggle_filter('all')} />
          {level_types.map(type => (
            <app_components.FilterButton
              key={type}
              type={type}
              label={level_meta[type]?.label ?? type}
              count={log_counts[type]}
              is_active={active_filters.has(type)}
              on_click={() => toggle_filter(type)}
              color={level_meta[type]?.color ?? [220, 220, 220]}
            />
          ))}
        </div>
        <div className="tabbar-actions">
          <app_components.ActionButton icon={lucide.RotateCcw} label="Reset" on_click={() => set_position(app_config.DEFAULT_POSITION)} />
          <app_components.ActionButton icon={lucide.Trash2} label="Clear" on_click={clear_logs} />
        </div>
      </div>

      <div ref={log_body_ref} className="log-body" onScroll={handle_scroll} onMouseDown={handle_log_mousedown}>
        {logs.map(log => {
          const meta = level_meta[log.type] ?? {};
          return (
            <app_components.LogRow
              key={log.id}
              type={log.type}
              badge={meta.badge}
              color={meta.color}
              background={meta.background}
              timestamp={log.timestamp}
              message={log.message}
              repeat_count={log.repeat_count}
              is_hidden={!active_filters.has(log.type)}
            />
          );
        })}
      </div>

      <div className="input-bar">
        <span className="input-prompt">❯</span>
        <input ref={input_ref} className="input-field" value={command_input} onChange={(e) => set_command_input(e.target.value)} placeholder="Enter command or expression..." autoComplete="off" spellCheck="false" />
      </div>

      <div className="resize-handle" onMouseDown={handle_resize_start}><span></span></div>
    </div>
  );
};