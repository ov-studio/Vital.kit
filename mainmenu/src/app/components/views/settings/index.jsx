import { useState, useEffect, useRef, useMemo } from 'react';
import { Checkbox }  from '@ui/checkbox';
import { Panel }     from '@ui/panel';
import { Section }   from '@ui/section';
import { Select }    from '@ui/select';
import { Stat, StatGrid } from '@ui/stat';
import { RangeSlider } from '../../rangeslider/index.jsx';
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

const QUALITY_OPTIONS = [
  { value: 'low',    label: 'Low'    },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High'   },
];

const DEFAULTS = {
  resolution:         '1600x900',
  window_mode:        'borderless',
  vsync:              true,
  quality:            'medium',
  draw_distance_mult: 1,
  volume:             0.8,
  max_width:          1920,
  max_height:         1080,
};

function from_engine(s) {
  const src = s || events.get_settings() || DEFAULTS;
  return {
    resolution:         src.resolution ?? DEFAULTS.resolution,
    window_mode:        src.window_mode ?? DEFAULTS.window_mode,
    vsync:              src.vsync ?? DEFAULTS.vsync,
    quality:            src.quality ?? DEFAULTS.quality,
    draw_distance_mult: src.draw_distance_mult ?? DEFAULTS.draw_distance_mult,
    volume:             src.volume ?? DEFAULTS.volume,
    max_width:          src.max_width ?? DEFAULTS.max_width,
    max_height:         src.max_height ?? DEFAULTS.max_height,
  };
}

function filter_resolutions(maxW, maxH) {
  const list = ALL_RESOLUTIONS.filter(o => o.w <= maxW && o.h <= maxH);
  // Always keep at least the smallest preset.
  return list.length ? list : ALL_RESOLUTIONS.slice(0, 1);
}

function clamp_resolution(value, options) {
  if (options.some(o => o.value === value)) return value;
  return options[options.length - 1]?.value ?? DEFAULTS.resolution;
}

export function ViewSettings() {
  const initial = from_engine();
  const [maxW, setMaxW]                 = useState(initial.max_width);
  const [maxH, setMaxH]                 = useState(initial.max_height);
  const res_options = useMemo(() => filter_resolutions(maxW, maxH), [maxW, maxH]);

  const [resolution, setResolution]     = useState(() => clamp_resolution(initial.resolution, filter_resolutions(initial.max_width, initial.max_height)));
  const [windowMode, setWindowMode]     = useState(initial.window_mode);
  const [vsync, setVsync]               = useState(initial.vsync);
  const [quality, setQuality]           = useState(initial.quality);
  const [drawDistance, setDrawDistance] = useState(Math.round((initial.draw_distance_mult ?? 1) * 100));
  const [volume, setVolume]             = useState(Math.round((initial.volume ?? 0.8) * 100));
  const skip_emit = useRef(true);

  useEffect(() => {
    function on_loaded(e) {
      const s = from_engine(e.detail);
      const opts = filter_resolutions(s.max_width, s.max_height);
      skip_emit.current = true;
      setMaxW(s.max_width);
      setMaxH(s.max_height);
      setResolution(clamp_resolution(s.resolution, opts));
      setWindowMode(s.window_mode);
      setVsync(s.vsync);
      setQuality(s.quality);
      setDrawDistance(Math.round((s.draw_distance_mult ?? 1) * 100));
      setVolume(Math.round((s.volume ?? 0.8) * 100));
    }
    window.addEventListener('mainmenu:settings_loaded', on_loaded);
    return () => window.removeEventListener('mainmenu:settings_loaded', on_loaded);
  }, []);

  useEffect(() => {
    if (skip_emit.current) {
      skip_emit.current = false;
      return;
    }
    events.settings_update({
      resolution,
      window_mode:        windowMode,
      vsync,
      quality,
      draw_distance_mult: drawDistance / 100,
      volume:             volume / 100,
    });
  }, [resolution, windowMode, vsync, quality, drawDistance, volume]);

  return (
    <div className="view">
      <div className="view-body">
        <Section>Display</Section>
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
            <Checkbox label="Enabled" checked={vsync} onChange={setVsync} />
          </SettingRow>
        </Panel>

        <Section>Graphics</Section>
        <Panel>
          <SettingRow name="Quality Preset" desc="Anti-aliasing quality (MSAA) — Low off, Medium 2×, High 4×">
            <Select value={quality} onChange={setQuality} options={QUALITY_OPTIONS} aria-label="Quality preset" />
          </SettingRow>
          <SettingRow name="Draw Distance" desc="Client multiplier on the active camera far plane (100% = default)">
            <RangeSlider label="Draw distance" value={drawDistance} onChange={setDrawDistance} />
          </SettingRow>
        </Panel>

        <Section>Audio</Section>
        <Panel>
          <SettingRow name="Master Volume" desc="Master bus volume (0–100%)">
            <RangeSlider label="Master volume" value={volume} onChange={setVolume} />
          </SettingRow>
        </Panel>

        <Section>About</Section>
        <StatGrid minWidth="150px">
          <Stat label="Vital.sandbox"  value="v2.4.1" />
          <Stat label="Vital.kit"     value="b3095-beta" />
        </StatGrid>
      </div>
    </div>
  );
}
