import { useState, useEffect, useRef, useCallback } from 'react';

const is_faded = () => document.documentElement.classList.contains('is-faded');

export function useEventState(event, get) {
  const [value, setValue] = useState(get);
  useEffect(() => {
    const on = (e) => setValue(e.detail ?? get());
    window.addEventListener(event, on);
    setValue(get());
    return () => window.removeEventListener(event, on);
  }, [event, get]);
  return value;
}

export function usePolling(fn, ms, active = true) {
  useEffect(() => {
    if (!active) return;
    const on_visible = (e) => { if (e.detail?.visible) fn(); };
    const timer = setInterval(() => { if (!is_faded()) fn(); }, ms);
    window.addEventListener('webview:visible', on_visible);
    fn();
    return () => {
      clearInterval(timer);
      window.removeEventListener('webview:visible', on_visible);
    };
  }, [fn, ms, active]);
}

export function usePopover() {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    if (!open) return;
    const on_down = (e) => { if (root.current && !root.current.contains(e.target)) setOpen(false); };
    const on_key  = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', on_down);
    document.addEventListener('keydown', on_key);
    return () => {
      document.removeEventListener('mousedown', on_down);
      document.removeEventListener('keydown', on_key);
    };
  }, [open]);
  return { open, toggle, root };
}
