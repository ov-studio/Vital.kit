const KEY = {
  // Alphabet
  'A': 'a',
  'B': 'b',
  'C': 'c',
  'D': 'd',
  'E': 'e',
  'F': 'f',
  'G': 'g',
  'H': 'h',
  'I': 'i',
  'J': 'j',
  'K': 'k',
  'L': 'l',
  'M': 'm',
  'N': 'n',
  'O': 'o',
  'P': 'p',
  'Q': 'q',
  'R': 'r',
  'S': 's',
  'T': 't',
  'U': 'u',
  'V': 'v',
  'W': 'w',
  'X': 'x',
  'Y': 'y',
  'Z': 'z',

  // Digits
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',

  // Numpad Digits
  'NUM_0': 'Insert',
  'NUM_1': 'End',
  'NUM_2': 'ArrowDown',
  'NUM_3': 'PageDown',
  'NUM_4': 'ArrowLeft',
  'NUM_5': 'Clear',
  'NUM_6': 'ArrowRight',
  'NUM_7': 'Home',
  'NUM_8': 'ArrowUp',
  'NUM_9': 'PageUp',

  // Numpad Operators
  'NUM_ADD': '+',
  'NUM_SUBTRACT': '-',
  'NUM_MULTIPLY': '*',
  'NUM_DIVIDE': '/',
  'NUM_PERIOD': '.',

  // Function Keys
  'F1': 'F1',
  'F2': 'F2',
  'F3': 'F3',
  'F4': 'F4',
  'F5': 'F5',
  'F6': 'F6',
  'F7': 'F7',
  'F8': 'F8',
  'F9': 'F9',
  'F10': 'F10',
  'F11': 'F11',
  'F12': 'F12',
  'F13': 'F13',
  'F14': 'F14',
  'F15': 'F15',
  'F16': 'F16',
  'F17': 'F17',
  'F18': 'F18',
  'F19': 'F19',
  'F20': 'F20',
  'F21': 'F21',
  'F22': 'F22',
  'F23': 'F23',
  'F24': 'F24',

  // Arrow Keys
  'UP': 'ArrowUp',
  'DOWN': 'ArrowDown',
  'LEFT': 'ArrowLeft',
  'RIGHT': 'ArrowRight',

  // Control Keys
  'SPACE': ' ',
  'ENTER': 'Enter',
  'KP_ENTER': 'Enter',
  'ESCAPE': 'Escape',
  'TAB': 'Tab',
  'BACKTAB': 'Tab',
  'BACKSPACE': 'Backspace',
  'INSERT': 'Insert',
  'DELETE': 'Delete',
  'HOME': 'Home',
  'END': 'End',
  'PAGE_UP': 'PageUp',
  'PAGE_DOWN': 'PageDown',
  'PAUSE': 'Pause',
  'PRINT': 'PrintScreen',
  'CLEAR': 'Clear',
  'MENU': 'ContextMenu',

  // Modifier Keys
  'SHIFT': 'Shift',
  'LSHIFT': 'Shift',
  'RSHIFT': 'Shift',
  'CTRL': 'Control',
  'LCTRL': 'Control',
  'RCTRL': 'Control',
  'ALT': 'Alt',
  'LALT': 'Alt',
  'RALT': 'Alt',
  'META': 'Meta',
  'LMETA': 'Meta',
  'RMETA': 'Meta',

  // Lock Keys
  'CAPS_LOCK': 'CapsLock',
  'NUM_LOCK': 'NumLock',
  'SCROLL_LOCK': 'ScrollLock',

  // Punctuation & Symbols
  'EXCLAM': '!',
  'QUOTEDBL': '"',
  'NUMBER_SIGN': '#',
  'DOLLAR': '$',
  'PERCENT': '%',
  'AMPERSAND': '&',
  'APOSTROPHE': "'",
  'PAREN_LEFT': '(',
  'PAREN_RIGHT': ')',
  'ASTERISK': '*',
  'PLUS': '+',
  'COMMA': ',',
  'MINUS': '-',
  'PERIOD': '.',
  'SLASH': '/',
  'COLON': ':',
  'SEMICOLON': ';',
  'LESS': '<',
  'EQUAL': '=',
  'GREATER': '>',
  'QUESTION': '?',
  'AT': '@',
  'BRACKET_LEFT': '[',
  'BACKSLASH': '\\',
  'BRACKET_RIGHT': ']',
  'CIRCUM': '^',
  'UNDERSCORE': '_',
  'QUOTE_LEFT': '`',
  'BRACE_LEFT': '{',
  'BAR': '|',
  'BRACE_RIGHT': '}',
  'TILDE': '~',

  // Volume & Media Keys
  'VOLUME_DOWN': 'AudioVolumeDown',
  'VOLUME_MUTE': 'AudioVolumeMute',
  'VOLUME_UP': 'AudioVolumeUp',
  'MEDIA_PLAY': 'MediaPlayPause',
  'MEDIA_STOP': 'MediaStop',
  'MEDIA_PREVIOUS': 'MediaTrackPrevious',
  'MEDIA_NEXT': 'MediaTrackNext',
  'MEDIA_RECORD': 'MediaRecord',

  // Mouse Buttons
  'MOUSE_LEFT': 'MouseLeft',
  'MOUSE_RIGHT': 'MouseRight',
  'MOUSE_MIDDLE': 'MouseMiddle',
  'MOUSE_WHEEL_UP': 'MouseWheelUp',
  'MOUSE_WHEEL_DOWN': 'MouseWheelDown',
  'MOUSE_XBUTTON1': 'MouseXButton1',
  'MOUSE_XBUTTON2': 'MouseXButton2',
};

export function godot_to_key(key) {
  if (!key) return null;
  return KEY[key.toUpperCase()] ?? key;
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