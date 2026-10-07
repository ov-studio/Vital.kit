import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@ui/button';
import * as events from '../../events.js';
import './index.css';

const HOST = '127.0.0.1';
const HTTP_PORT = 7778;  // Vital.server default `http.port`; its /info endpoint doubles as the "is it running" probe
const POLL_MS = 4000;
const TIMEOUT_MS = 1500;

/* Polls the local server's /info while `active`. Returns its public info, or null when nothing answers. */
function useLocalServer(active) {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!active) return;
    let stop = false;
    let timer;

    const probe = async () => {
      const abort = new AbortController();
      const cut = setTimeout(() => abort.abort(), TIMEOUT_MS);
      try {
        const res  = await fetch(`http://${HOST}:${HTTP_PORT}/info`, { signal: abort.signal, cache: 'no-store' });
        const data = await res.json();
        if (!stop) setInfo(Number.isInteger(data?.port) ? data : null);
      } catch {
        if (!stop) setInfo(null);
      } finally {
        clearTimeout(cut);
        if (!stop) timer = setTimeout(probe, POLL_MS);
      }
    };

    probe();
    return () => { stop = true; clearTimeout(timer); };
  }, [active]);

  return info;
}

/* Shows the server running on this machine, if any, with a one-click connect. Renders nothing otherwise. */
export function LocalServer({ active }) {
  const info = useLocalServer(active);
  if (!info) return null;

  const http_port = Number.isInteger(info.http_port) ? info.http_port : HTTP_PORT;
  const players   = Number.isInteger(info.players) ? `${info.players}${info.max_peers ? ` / ${info.max_peers}` : ''} players` : null;

  return (
    <div className="localserver">
      <span className="ls-dot" aria-hidden />
      <div className="ls-info">
        <span className="ls-label">Local server</span>
        <span className="ls-name">{info.name}</span>
      </div>
      <span className="ls-meta">{[players, `${HOST}:${info.port}`].filter(Boolean).join('  ·  ')}</span>
      <Button className="ls-join" onClick={() => events.connect(HOST, info.port, http_port)}>
        <Play size={11} fill="currentColor" />
        Connect
      </Button>
    </div>
  );
}
