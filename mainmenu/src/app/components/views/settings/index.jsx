import { useState, useEffect, useRef } from 'react';
import { Checkbox }  from '@ui/checkbox';
import { Panel }     from '@ui/panel';
import { Section }   from '@ui/section';
import { Select }    from '@ui/select';
import { Stat, StatGrid } from '@ui/stat';
import { RangeSlider } from '../../rangeslider/index.jsx';
import { SettingRow }  from '../../settingrow/index.jsx';
import * as events     from '../../../events.js';
import './index.css';

const RESOLUTION_OPTIONS = [
  { value: '1280x720',  label: '1280 × 720'  },
  { value: '1366x768',  label: '1366 × 768'  },
  { value: '1600x900',  label: '1600 × 900'  },
  { value: '1920x1080', label: '1920 × 1080' },
  { value: '2560x1440', label: '2560 × 1440' },
  { value: '3840x2160', label: '3840 × 2160' },
];

const WINDOW_MODE_OPTIONS = [
  { value: 'windowed',   label: 'Windowed' },
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
  };
}

export function ViewSettings() {
  const initial = from_engine();
  const [resolution, setResolution]     = useState(initial.resolution);
  const [windowMode, setWindowMode]     = useState(initial.window_mode);
  const [vsync, setVsync]               = useState(initial.vsync);
  const [quality, setQuality]           = useState(initial.quality);
  const [drawDistance, setDrawDistance] = useState(Math.round((initial.draw_distance_mult ?? 1) * 100));
  const [volume, setVolume]             = useState(Math.round((initial.volume ?? 0.8) * 100));
  const skip_emit = useRef(true);

  // Hydrate when C++ pushes settings after ready.
  useEffect(() => {
    function on_loaded(e) {
      const s = from_engine(e.detail);
      skip_emit.current = true;
      setResolution(s.resolution);
      setWindowMode(s.window_mode);
      setVsync(s.vsync);
      setQuality(s.quality);
      setDrawDistance(Math.round((s.draw_distance_mult ?? 1) * 100));
      setVolume(Math.round((s.volume ?? 0.8) * 100));
    }
    window.addEventListener('mainmenu:settings_loaded', on_loaded);
    return () => window.removeEventListener('mainmenu:settings_loaded', on_loaded);
  }, []);

  // Push user changes only (skip first paint + hydrate).
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
          <SettingRow name="Resolution" desc="Game window size — applied immediately and saved">
            <Select
              value={resolution}
              onChange={setResolution}
              options={RESOLUTION_OPTIONS}
              aria-label="Resolution"
            />
          </SettingRow>
          <SettingRow name="Window Mode" desc="Windowed, borderless, or exclusive fullscreen">
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
          <SettingRow name="Quality Preset" desc="Overall rendering quality — shadows, textures, effects">
            <Select value={quality} onChange={setQuality} options={QUALITY_OPTIONS} aria-label="Quality preset" />
          </SettingRow>
          <SettingRow name="Draw Distance" desc="Multiplier applied on top of the server's draw distance">
            <RangeSlider label="Draw distance" value={drawDistance} onChange={setDrawDistance} />
          </SettingRow>
        </Panel>

        <Section>Audio</Section>
        <Panel>
          <SettingRow name="Game Volume" desc="Overall in-game audio volume">
            <RangeSlider label="Game volume" value={volume} onChange={setVolume} />
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
