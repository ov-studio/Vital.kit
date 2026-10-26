import { useState, useEffect, useRef, useMemo } from 'react';
import { Badge }     from '@ui/badge';
import { Panel }     from '@ui/panel';
import { Select }    from '@ui/select';
import { RangeSlider } from '@ui/rangeslider';
import { SettingRow }  from '../../settingrow/index.jsx';
import * as events     from '../../../events.js';
import './index.css';

const ALL_RESOLUTIONS = [
  { value: '1280x720',  label: '1280 × 720',  w: 1280, h: 720  },
  { value: '1366x768',  label: '1366 × 768',  w: 1366, h: 768  },
  { value: '1600x900',  label: '1600 × 900',  w: 1600, h: 900  },
  { value: '1920x1080', label: '1920 × 1080', w: 1920, h: 1080 },
  { value: '2560x1440', label: '2560 × 1440', w: 2560, h: 1440 },
  { value: '3840x2160', label: '3840 × 2160', w: 3840, h: 2160 },
];

const WINDOW_MODE_OPTIONS = [
  { value: 'borderless', label: 'Borderless' },
  { value: 'fullscreen', label: 'Fullscreen' },
];

const VSYNC_OPTIONS = [
  { value: 'enabled',  label: 'Enabled'  },
  { value: 'disabled', label: 'Disabled' },
];

const DEFAULTS = {
  resolution:              '1600x900',
  window_mode:             'borderless',
  vsync:                   true,
  draw_distance_mult:      1,
  particle_distance_mult:  1,
  volume:                  0.8,
  mouse_sens_horizontal:   1,
  mouse_sens_vertical:     1,
  max_width:               1920,
  max_height:              1080,
};

function from_engine(s) {
  const src = s || events.get_settings() || DEFAULTS;
  return {
    resolution:             src.resolution ?? DEFAULTS.resolution,
    window_mode:            src.window_mode ?? DEFAULTS.window_mode,
    vsync:                  src.vsync ?? DEFAULTS.vsync,
    draw_distance_mult:     src.draw_distance_mult ?? DEFAULTS.draw_distance_mult,
    particle_distance_mult: src.particle_distance_mult ?? DEFAULTS.particle_distance_mult,
    volume:                 src.volume ?? DEFAULTS.volume,
    mouse_sens_horizontal:  src.mouse_sens_horizontal ?? DEFAULTS.mouse_sens_horizontal,
    mouse_sens_vertical:    src.mouse_sens_vertical ?? DEFAULTS.mouse_sens_vertical,
    max_width:              src.max_width ?? DEFAULTS.max_width,
    max_height:             src.max_height ?? DEFAULTS.max_height,
  };
}

function filter_resolutions(maxW, maxH) {
  const list = ALL_RESOLUTIONS.filter(o => o.w <= maxW && o.h <= maxH);
  return list.length ? list : ALL_RESOLUTIONS.slice(0, 1);
}

/* Identity of the values the controls hold; used to tell engine-fed values (no write-back) from user edits. */
const sync_key = (resolution, window_mode, vsync, draw_distance, particle_distance, volume, mouse_h, mouse_v) =>
  `${resolution}|${window_mode}|${vsync}|${draw_distance}|${particle_distance}|${volume}|${mouse_h}|${mouse_v}`;

function clamp_resolution(value, options) {
  if (options.some(o => o.value === value)) return value;
  return options[options.length - 1]?.value ?? DEFAULTS.resolution;
}

function pct(mult, fallback = 1) {
  return Math.round((mult ?? fallback) * 100);
}

export function ViewSettings() {
  const initial = from_engine();
  const [maxW, setMaxW]                 = useState(initial.max_width);
  const [maxH, setMaxH]                 = useState(initial.max_height);
  const res_options = useMemo(() => filter_resolutions(maxW, maxH), [maxW, maxH]);

  const [resolution, setResolution]     = useState(() => clamp_resolution(initial.resolution, filter_resolutions(initial.max_width, initial.max_height)));
  const [windowMode, setWindowMode]     = useState(initial.window_mode);
  const [vsync, setVsync]               = useState(initial.vsync);
  const [drawDistance, setDrawDistance] = useState(pct(initial.draw_distance_mult, 1));
  const [particleDistance, setParticleDistance] = useState(pct(initial.particle_distance_mult, 1));
  const [volume, setVolume]             = useState(pct(initial.volume, 0.8));
  const [mouseH, setMouseH]             = useState(pct(initial.mouse_sens_horizontal, 1));
  const [mouseV, setMouseV]             = useState(pct(initial.mouse_sens_vertical, 1));

  const synced = useRef(sync_key(
    clamp_resolution(initial.resolution, filter_resolutions(initial.max_width, initial.max_height)),
    initial.window_mode,
    initial.vsync,
    pct(initial.draw_distance_mult, 1),
    pct(initial.particle_distance_mult, 1),
    pct(initial.volume, 0.8),
    pct(initial.mouse_sens_horizontal, 1),
    pct(initial.mouse_sens_vertical, 1),
  ));

  useEffect(() => {
    function on_loaded(e) {
      const s = from_engine(e.detail);
      const opts = filter_resolutions(s.max_width, s.max_height);
      const res = clamp_resolution(s.resolution, opts);
      const dist = pct(s.draw_distance_mult, 1);
      const pdist = pct(s.particle_distance_mult, 1);
      const vol = pct(s.volume, 0.8);
      const mh = pct(s.mouse_sens_horizontal, 1);
      const mv = pct(s.mouse_sens_vertical, 1);
      synced.current = sync_key(res, s.window_mode, s.vsync, dist, pdist, vol, mh, mv);
      setMaxW(s.max_width);
      setMaxH(s.max_height);
      setResolution(res);
      setWindowMode(s.window_mode);
      setVsync(s.vsync);
      setDrawDistance(dist);
      setParticleDistance(pdist);
      setVolume(vol);
      setMouseH(mh);
      setMouseV(mv);
    }
    if (events.get_settings()) on_loaded({ detail: events.get_settings() });
    window.addEventListener('mainmenu:settings_loaded', on_loaded);
    return () => window.removeEventListener('mainmenu:settings_loaded', on_loaded);
  }, []);

  useEffect(() => {
    const key = sync_key(resolution, windowMode, vsync, drawDistance, particleDistance, volume, mouseH, mouseV);
    if (key === synced.current) return;
    synced.current = key;
    events.settings_update({
      resolution,
      window_mode:            windowMode,
      vsync,
      draw_distance_mult:     drawDistance / 100,
      particle_distance_mult: particleDistance / 100,
      volume:                 volume / 100,
      mouse_sens_horizontal:  mouseH / 100,
      mouse_sens_vertical:    mouseV / 100,
    });
  }, [resolution, windowMode, vsync, drawDistance, particleDistance, volume, mouseH, mouseV]);

  return (
    <div className="view">
      <div className="view-body">
        <Badge className="play-badge">Display</Badge>
        <Panel>
          <SettingRow name="Resolution" desc="Game window size — capped to your monitor, applied and saved">
            <Select
              value={resolution}
              onChange={setResolution}
              options={res_options}
              aria-label="Resolution"
            />
          </SettingRow>
          <SettingRow name="Window Mode" desc="Borderless window with custom title bar, or exclusive fullscreen">
            <Select
              value={windowMode}
              onChange={setWindowMode}
              options={WINDOW_MODE_OPTIONS}
              aria-label="Window mode"
            />
          </SettingRow>
          <SettingRow name="VSync" desc="Sync frame rate to your monitor's refresh rate">
            <Select
              value={vsync ? 'enabled' : 'disabled'}
              onChange={(v) => setVsync(v === 'enabled')}
              options={VSYNC_OPTIONS}
              aria-label="VSync"
            />
          </SettingRow>
        </Panel>

        <Badge className="play-badge">Graphics</Badge>
        <Panel>
          <SettingRow name="Draw Distance" desc="Client multiplier on the active camera far plane (100% = default)">
            <RangeSlider label="Draw distance" value={drawDistance} onChange={setDrawDistance} />
          </SettingRow>
          <SettingRow name="Particle Distance" desc="GPU particles stop rendering past this share of the camera far plane (100% = no extra limit)">
            <RangeSlider label="Particle distance" value={particleDistance} onChange={setParticleDistance} />
          </SettingRow>
        </Panel>

        <Badge className="play-badge">Controls</Badge>
        <Panel>
          <SettingRow name="Horizontal Mouse Sensitivity" desc="Look left/right speed (100% = default)">
            <RangeSlider label="Horizontal mouse sensitivity" value={mouseH} onChange={setMouseH} min={1} max={200} />
          </SettingRow>
          <SettingRow name="Vertical Mouse Sensitivity" desc="Look up/down speed (100% = default)">
            <RangeSlider label="Vertical mouse sensitivity" value={mouseV} onChange={setMouseV} min={1} max={200} />
          </SettingRow>
        </Panel>

        <Badge className="play-badge">Audio</Badge>
        <Panel>
          <SettingRow name="Master Volume" desc="Master bus volume (0–100%)">
            <RangeSlider label="Master volume" value={volume} onChange={setVolume} />
          </SettingRow>
        </Panel>
      </div>
    </div>
  );
}
