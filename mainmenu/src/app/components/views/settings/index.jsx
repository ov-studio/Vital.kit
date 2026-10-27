import { useState, useEffect, useMemo } from 'react';
import { Badge }       from '@ui/badge';
import { Panel }       from '@ui/panel';
import { Select }      from '@ui/select';
import { RangeSlider } from '@ui/rangeslider';
import { SettingRow }  from '../../settingrow/index.jsx';
import * as events     from '../../../events.js';
import * as config     from '../../../config.js';
import './index.css';

const SAVED = ['resolution', 'window_mode', 'vsync', 'draw_distance', 'particle_distance', 'volume', 'mouse_horizontal_senstivity', 'mouse_vertical_senstivity'];

function filter_resolutions(max_w, max_h) {
  const list = config.RESOLUTIONS.filter(o => o.w <= max_w && o.h <= max_h);
  return list.length ? list : config.RESOLUTIONS.slice(0, 1);
}

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

  const percent = (key) => ({
    value:    Math.round(values[key] * 100),
    onChange: (v) => set({ [key]: v / 100 }),
  });

  return (
    <div className="view">
      <div className="view-body">
        <Badge className="play-badge">Display</Badge>
        <Panel>
          <SettingRow name="Resolution" desc="Sets the size of the game window, up to your monitor's resolution.">
            <Select value={values.resolution} onChange={(v) => set({ resolution: v })} options={res_options} aria-label="Resolution" />
          </SettingRow>
          <SettingRow name="Window Mode" desc="Choose between a borderless window and exclusive fullscreen.">
            <Select value={values.window_mode} onChange={(v) => set({ window_mode: v })} options={config.WINDOW_MODES} aria-label="Window mode" />
          </SettingRow>
          <SettingRow name="VSync" desc="Matches the frame rate to your display's refresh rate to prevent screen tearing.">
            <Select value={values.vsync ? 'enabled' : 'disabled'} onChange={(v) => set({ vsync: v === 'enabled' })} options={config.VSYNC_MODES} aria-label="VSync" />
          </SettingRow>
        </Panel>

        <Badge className="play-badge">Graphics</Badge>
        <Panel>
          <SettingRow name="Draw Distance" desc="Adjusts how far the world is rendered. Lower values improve performance.">
            <RangeSlider label="Draw distance" {...percent('draw_distance')} />
          </SettingRow>
          <SettingRow name="Particle Distance" desc="Adjusts how far particle effects are rendered. Lower values improve performance.">
            <RangeSlider label="Particle distance" {...percent('particle_distance')} />
          </SettingRow>
        </Panel>

        <Badge className="play-badge">Controls</Badge>
        <Panel>
          <SettingRow name="Horizontal Mouse Sensitivity" desc="Adjusts how quickly the camera turns left and right.">
            <RangeSlider label="Horizontal mouse sensitivity" {...percent('mouse_horizontal_senstivity')} min={1} max={200} />
          </SettingRow>
          <SettingRow name="Vertical Mouse Sensitivity" desc="Adjusts how quickly the camera turns up and down.">
            <RangeSlider label="Vertical mouse sensitivity" {...percent('mouse_vertical_senstivity')} min={1} max={200} />
          </SettingRow>
        </Panel>

        <Badge className="play-badge">Audio</Badge>
        <Panel>
          <SettingRow name="Master Volume" desc="Controls the overall volume of the game.">
            <RangeSlider label="Master volume" {...percent('volume')} />
          </SettingRow>
        </Panel>
      </div>
    </div>
  );
}
