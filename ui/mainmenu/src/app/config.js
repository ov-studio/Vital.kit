import * as shared from '../../../../shared/config.js';

export const SITE_URL = shared.SITE;
export const NEWS_URL = shared.NEWS;
export const LINKS = [
  { label: 'Documentations', url: shared.DOCS    },
  { label: 'Community',      url: shared.DISCORD },
  { label: 'Donate',         url: shared.DONATE  }
];

export const FADE_MS             = 220;       // menu fade before the host hides the webview
export const NEWS_REFRESH        = 5 * 60e3;  // news poll
export const MASTERLIST_REFRESH  = 15e3;      // masterlist poll until the host sends its own (config/masterlist.json)
export const LOCAL_SCAN_INTERVAL = 3e3;       // local server scan while the Play view is visible
export const FEATURED_INTERVAL   = 5e3;       // featured hero rotation
export const LOCAL_HOST          = '127.0.0.1';
export const NEWS_SLOTS          = 3;     // fixed number of news rows; missing ones show as open slots
export const FEATURED_COUNT      = 3;
export const CARD                = { minWidth: 210, gap: 14, ratio: 3 / 4 };

export const RESOLUTIONS = [
  [1280, 720],
  [1366, 768],
  [1600, 900],
  [1920, 1080],
  [2560, 1440],
  [3840, 2160]
].map(([w, h]) => ({ value: `${w}x${h}`, label: `${w} × ${h}`, w, h }));

export const WINDOW_MODES = [
  { value: 'borderless', label: 'Borderless' },
  { value: 'fullscreen', label: 'Fullscreen' }
];

export const VSYNC_MODES = [
  { value: 'enabled',  label: 'Enabled'  },
  { value: 'disabled', label: 'Disabled' }
];

export const SETTING_DEFAULTS = {
  resolution:             '1600x900',
  window_mode:            'borderless',
  vsync:                  true,
  draw_distance:               1,
  particle_distance:           1,
  volume:                      1,
  mouse_horizontal_senstivity: 1,
  mouse_vertical_senstivity:   1,
  max_width:              1920,
  max_height:             1080
};
