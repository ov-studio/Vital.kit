import { useState, useEffect } from 'react';
import { Checkbox }  from '@ui/checkbox';
import { PageHead }  from '@ui/pagehead';
import { Panel }     from '@ui/panel';
import { Section }   from '@ui/section';
import { Select }    from '@ui/select';
import { Stat, StatGrid } from '@ui/stat';
import { RangeSlider } from '../../rangeslider/index.jsx';
import { SettingRow }  from '../../settingrow/index.jsx';
import './index.css';

const QUALITY_OPTIONS = [
  { value: 'low',    label: 'Low'    },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High'   },
];

export function ViewSettings() {
  const [vsync, setVsync]               = useState(true);
  const [quality, setQuality]           = useState('medium');
  const [drawDistance, setDrawDistance] = useState(100);
  const [volume, setVolume]             = useState(80);

  useEffect(() => {
    window.ipc?.postMessage(JSON.stringify({
      action: 'settings_update',
      settings: { vsync, quality, draw_distance_mult: drawDistance / 100, volume: volume / 100 },
    }));
  }, [vsync, quality, drawDistance, volume]);

  return (
    <div className="view">
      <PageHead label="Preferences" title="Settings" />
      <div className="view-body">
        <Section>Graphics</Section>
        <Panel>
          <SettingRow name="VSync" desc="Sync frame rate to your monitor's refresh rate">
            <Checkbox label="Enabled" checked={vsync} onChange={setVsync} />
          </SettingRow>
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
          <Stat label="Launcher"  value="v2.4.1" />
          <Stat label="Build"     value="b3095-beta" />
          <Stat label="Scripting" value="Lua 5.4" />
          <Stat label="Engine"    value="Godot / C++17" />
          <Stat label="License"   value="Open Source" />
        </StatGrid>
      </div>
    </div>
  );
}
