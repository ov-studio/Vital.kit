import { useState, useEffect, useMemo } from 'react';
import { Badge }       from '@ui/badge';
import { Panel }       from '@ui/panel';
import { Select }      from '@ui/select';
import { RangeSlider } from '@ui/rangeslider';
import { SettingRow }  from '../../settingrow/index.jsx';
import * as events     from '../../../events.js';
import * as config     from '../../../config.js';
import './index.css';

/* Keys the host persists (max_width / max_height are read-only monitor limits). */
const SAVED = ['resolution', 'window_mode', 'vsync', 'draw_distance_mult', 'particle_distance_mult', 'volume', 'mouse_sens_horizontal', 'mouse_sens_vertical'];

/* Resolutions capped to the monitor; never empty. */
function filter_resolutions(max_w, max_h) {
  const list = config.RESOLUTIONS.filter(o => o.w <= max_w && o.h <= max_h);
  return list.length ? list : config.RESOLUTIONS.slice(0, 1);
}

/* Host settings (or the cached/default ones) -> UI values, with the resolution clamped to what the monitor allows. */
function from_engine(settings) {
  const src = settings ?? events.get_settings() ?? {};
  const values = Object.fromEntries(Object.entries(config.SETTING_DEFAULTS).map(([key, fallback]) => [key, src[key] ?? fallback]));
  const options = filter_resolutions(values.max_width, values.max_height);
  if (!options.some(o => o.value === values.resolution)) values.resolution = options[options.length - 1].value;
  return values;
}

export function ViewSettings() {
  const [values, setValues] = useState(from_engine);
  const res_options = useMemo(() => filter_resolutions(values.max_width, values.max_height), [values.max_width, values.max_height]);

  // Engine-fed values replace the state without writing back; only user edits go through `set`.
  useEffect(() => {
    const on_loaded = (e) => setValues(from_engine(e.detail));
    window.addEventListener('mainmenu:settings_loaded', on_loaded);
    return () => window.removeEventListener('mainmenu:settings_loaded', on_loaded);
  }, []);

  const set = (patch) => {
    const next = { ...values, ...patch };
    setValues(next);
    events.settings_update(Object.fromEntries(SAVED.map(key => [key, next[key]])));
  };

  // Multipliers are stored as 0..1 and edited as percent.
  const percent = (key) => ({
    value:    Math.round(values[key] * 100),
    onChange: (v) => set({ [key]: v / 100 }),
  });

  return (
    <div className="view">
      <div className="view-body">
        <Badge className="play-badge">Display</Badge>
        <Panel>
          <SettingRow name="Resolution" desc="Game window size — capped to your monitor, applied and saved">
            <Select value={values.resolution} onChange={(v) => set({ resolution: v })} options={res_options} aria-label="Resolution" />
          </SettingRow>
          <SettingRow name="Window Mode" desc="Borderless window with custom title bar, or exclusive fullscreen">
            <Select value={values.window_mode} onChange={(v) => set({ window_mode: v })} options={config.WINDOW_MODES} aria-label="Window mode" />
          </SettingRow>
          <SettingRow name="VSync" desc="Sync frame rate to your monitor's refresh rate">
            <Select value={values.vsync ? 'enabled' : 'disabled'} onChange={(v) => set({ vsync: v === 'enabled' })} options={config.VSYNC_MODES} aria-label="VSync" />
          </SettingRow>
        </Panel>

        <Badge className="play-badge">Graphics</Badge>
        <Panel>
          <SettingRow name="Draw Distance" desc="Client multiplier on the active camera far plane (100% = default)">
            <RangeSlider label="Draw distance" {...percent('draw_distance_mult')} />
          </SettingRow>
          <SettingRow name="Particle Distance" desc="GPU particles stop rendering past this share of the camera far plane (100% = no extra limit)">
            <RangeSlider label="Particle distance" {...percent('particle_distance_mult')} />
          </SettingRow>
        </Panel>

        <Badge className="play-badge">Controls</Badge>
        <Panel>
          <SettingRow name="Horizontal Mouse Sensitivity" desc="Look left/right speed (100% = default)">
            <RangeSlider label="Horizontal mouse sensitivity" {...percent('mouse_sens_horizontal')} min={1} max={200} />
          </SettingRow>
          <SettingRow name="Vertical Mouse Sensitivity" desc="Look up/down speed (100% = default)">
            <RangeSlider label="Vertical mouse sensitivity" {...percent('mouse_sens_vertical')} min={1} max={200} />
          </SettingRow>
        </Panel>

        <Badge className="play-badge">Audio</Badge>
        <Panel>
          <SettingRow name="Master Volume" desc="Master bus volume (0–100%)">
            <RangeSlider label="Master volume" {...percent('volume')} />
          </SettingRow>
        </Panel>
      </div>
    </div>
  );
}
