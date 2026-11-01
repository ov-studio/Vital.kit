import * as react                 from 'react';
import * as shared_ui_badge       from '@ui/badge';
import * as shared_ui_editbox     from '@ui/editbox';
import * as shared_ui_panel       from '@ui/panel';
import * as shared_ui_select      from '@ui/select';
import * as shared_ui_rangeslider from '@ui/rangeslider';
import * as app_settingrow        from '../../settingrow/index.jsx';
import * as app_events            from '../../../events.js';
import * as app_config            from '../../../config.js';
import * as app_hooks             from '../../../hooks.js';
import './index.css';

const SAVED = [
  'nickname', 
  'resolution', 
  'window_mode', 
  'vsync', 
  'draw_distance', 
  'particle_distance', 
  'volume', 
  'mouse_horizontal_senstivity', 
  'mouse_vertical_senstivity'
];

function filter_resolutions(max_w, max_h) {
  const list = app_config.RESOLUTIONS.filter(o => o.w <= max_w && o.h <= max_h);
  return list.length ? list : app_config.RESOLUTIONS.slice(0, 1);
}

function from_engine(settings) {
  const src = settings ?? app_events.get_settings() ?? {};
  const values = Object.fromEntries(Object.entries(app_config.SETTING_DEFAULTS).map(([key, fallback]) => [key, src[key] ?? fallback]));
  const options = filter_resolutions(values.max_width, values.max_height);
  if (!options.some(o => o.value === values.resolution)) values.resolution = options[options.length - 1].value;
  return values;
}

export function ViewSettings() {
  const [values, setValues] = react.useState(from_engine);
  const os_name = app_hooks.useEventState('mainmenu:username', app_events.get_os_username) || 'Player';
  const res_options = react.useMemo(() => filter_resolutions(values.max_width, values.max_height), [values.max_width, values.max_height]);

  react.useEffect(() => {
    const on_loaded = (e) => setValues(from_engine(e.detail));
    window.addEventListener('mainmenu:settings_loaded', on_loaded);
    return () => window.removeEventListener('mainmenu:settings_loaded', on_loaded);
  }, []);

  const set = (patch) => {
    const next = { ...values, ...patch };
    setValues(next);
    app_events.settings_update(Object.fromEntries(SAVED.map(key => [key, next[key]])));
  };

  const percent = (key) => ({
    value:    Math.round(values[key] * 100),
    onChange: (v) => set({ [key]: v / 100 }),
  });

  return (
    <div className="view">
      <div className="view-body">
        <shared_ui_badge.Badge className="play-badge">Profile</shared_ui_badge.Badge>
        <shared_ui_panel.Panel>
          <app_settingrow.SettingRow name="Nickname" desc="The name shown in the menu. Leave empty to use your system username.">
            <shared_ui_editbox.EditBox
              value={values.nickname}
              onChange={(v) => setValues((prev) => ({ ...prev, nickname: v }))}
              onCommit={(v) => set({ nickname: v.trim() })}
              placeholder={os_name}
              maxLength={app_config.NICKNAME_MAX}
              aria-label="Nickname"
            />
          </app_settingrow.SettingRow>
        </shared_ui_panel.Panel>

        <shared_ui_badge.Badge className="play-badge">Display</shared_ui_badge.Badge>
        <shared_ui_panel.Panel>
          <app_settingrow.SettingRow name="Resolution" desc="Sets the size of the game window, up to your monitor's resolution.">
            <shared_ui_select.Select value={values.resolution} onChange={(v) => set({ resolution: v })} options={res_options} aria-label="Resolution"/>
          </app_settingrow.SettingRow>
          <app_settingrow.SettingRow name="Window Mode" desc="Choose between a borderless window and exclusive fullscreen.">
            <shared_ui_select.Select value={values.window_mode} onChange={(v) => set({ window_mode: v })} options={app_config.WINDOW_MODES} aria-label="Window mode"/>
          </app_settingrow.SettingRow>
          <app_settingrow.SettingRow name="VSync" desc="Matches the frame rate to your display's refresh rate to prevent screen tearing.">
            <shared_ui_select.Select value={values.vsync ? 'enabled' : 'disabled'} onChange={(v) => set({ vsync: v === 'enabled' })} options={app_config.VSYNC_MODES} aria-label="VSync"/>
          </app_settingrow.SettingRow>
        </shared_ui_panel.Panel>

        <shared_ui_badge.Badge className="play-badge">Graphics</shared_ui_badge.Badge>
        <shared_ui_panel.Panel>
          <app_settingrow.SettingRow name="Draw Distance" desc="Adjusts how far the world is rendered. Lower values improve performance.">
            <shared_ui_rangeslider.RangeSlider label="Draw distance" {...percent('draw_distance')}/>
          </app_settingrow.SettingRow>
          <app_settingrow.SettingRow name="Particle Distance" desc="Adjusts how far particle effects are rendered. Lower values improve performance.">
            <shared_ui_rangeslider.RangeSlider label="Particle distance" {...percent('particle_distance')}/>
          </app_settingrow.SettingRow>
        </shared_ui_panel.Panel>

        <shared_ui_badge.Badge className="play-badge">Controls</shared_ui_badge.Badge>
        <shared_ui_panel.Panel>
          <app_settingrow.SettingRow name="Horizontal Mouse Sensitivity" desc="Adjusts how quickly the camera turns left and right.">
            <shared_ui_rangeslider.RangeSlider label="Horizontal mouse sensitivity" {...percent('mouse_horizontal_senstivity')} min={1} max={200}/>
          </app_settingrow.SettingRow>
          <app_settingrow.SettingRow name="Vertical Mouse Sensitivity" desc="Adjusts how quickly the camera turns up and down.">
            <shared_ui_rangeslider.RangeSlider label="Vertical mouse sensitivity" {...percent('mouse_vertical_senstivity')} min={1} max={200}/>
          </app_settingrow.SettingRow>
        </shared_ui_panel.Panel>

        <shared_ui_badge.Badge className="play-badge">Audio</shared_ui_badge.Badge>
        <shared_ui_panel.Panel>
          <app_settingrow.SettingRow name="Master Volume" desc="Controls the overall volume of the game.">
            <shared_ui_rangeslider.RangeSlider label="Master volume" {...percent('volume')}/>
          </app_settingrow.SettingRow>
        </shared_ui_panel.Panel>
      </div>
    </div>
  );
}
