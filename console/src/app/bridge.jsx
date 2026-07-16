const GODOT_KEY = {
  // Printable
  'asciitilde': '~', 'quoteleft': '`', 'exclam': '!', 'quotedbl': '"',
  'numbersign': '#', 'dollar': '$', 'percent': '%', 'ampersand': '&',
  'apostrophe': "'", 'parenleft': '(', 'parenright': ')', 'asterisk': '*',
  'plus': '+', 'comma': ',', 'minus': '-', 'period': '.', 'slash': '/',
  'colon': ':', 'semicolon': ';', 'less': '<', 'equal': '=', 'greater': '>',
  'question': '?', 'at': '@', 'bracketleft': '[', 'backslash': '\\',
  'bracketright': ']', 'asciicircum': '^', 'underscore': '_',
  'braceleft': '{', 'bar': '|', 'braceright': '}', 'space': ' ',

  // Special
  'escape': 'Escape', 'tab': 'Tab', 'backspace': 'Backspace',
  'enter': 'Enter', 'delete': 'Delete', 'insert': 'Insert',
  'home': 'Home', 'end': 'End', 'pageup': 'PageUp', 'pagedown': 'PageDown',
  'left': 'ArrowLeft', 'right': 'ArrowRight', 'up': 'ArrowUp', 'down': 'ArrowDown',

  // Function keys
  'f1': 'F1', 'f2': 'F2', 'f3': 'F3', 'f4': 'F4', 'f5': 'F5', 'f6': 'F6',
  'f7': 'F7', 'f8': 'F8', 'f9': 'F9', 'f10': 'F10', 'f11': 'F11', 'f12': 'F12',
};

export function godot_to_key(key) {
  if (!key) return null;
  return GODOT_KEY[key.toLowerCase()] ?? key;
}

export const make_key = (type, msg) => `${type}:${msg}`;
export const rgb_to_css = (rgb) => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
export const rgb_to_css_alpha = (rgb, a) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
export const rgb_lighten = (rgb, factor) => [
  Math.round(rgb[0] + (255 - rgb[0]) * factor),
  Math.round(rgb[1] + (255 - rgb[1]) * factor),
  Math.round(rgb[2] + (255 - rgb[2]) * factor),
];

export const parse_lines = (message) => {
  if (typeof message !== 'string') return [{ is_quote: false, text: String(message) }];
  const groups = [];
  let open_code = false;
  message.split('\n').forEach(raw_line => {
    const prev = groups[groups.length - 1];
    if (open_code && prev) {
      prev.text += '\n' + raw_line;
      if (((raw_line.match(/`/g) || []).length) % 2 === 1) open_code = false;
      return;
    }
    const match = raw_line.match(/^>\s?(.*)/);
    const is_quote = !!match;
    const text = match ? match[1] : raw_line;
    groups.push({ is_quote, text });
    if (((text.match(/`/g) || []).length) % 2 === 1) open_code = true;
  })
  return groups;
};

export const parse_segments = (text) => {
  const segments = [];
  const regex = /`([^`]+)`/g;
  let last = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      const t = text.slice(last, match.index).replace(/^\n+/, '').replace(/\n+$/, '');
      if (t) segments.push({ is_code: false, text: t });
    }
    segments.push({ is_code: true, text: match[1] });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    const t = text.slice(last).replace(/^\n+/, '').replace(/\n+$/, '');
    if (t) segments.push({ is_code: false, text: t });
  }
  return segments;
};