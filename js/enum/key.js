/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: enum: key.js
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 14/09/2022
     Desc: Key Enum
----------------------------------------------------------------*/


////////////////
// Enum: Key //
////////////////

window.KEY = {
    // Alphabet
    A: "a",
    B: "b",
    C: "c",
    D: "d",
    E: "e",
    F: "f",
    G: "g",
    H: "h",
    I: "i",
    J: "j",
    K: "k",
    L: "l",
    M: "m",
    N: "n",
    O: "o",
    P: "p",
    Q: "q",
    R: "r",
    S: "s",
    T: "t",
    U: "u",
    V: "v",
    W: "w",
    X: "x",
    Y: "y",
    Z: "z",

    // Digits
    0: "0",
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",

    // Numpad Digits
    NUM_0: "0",
    NUM_1: "1",
    NUM_2: "2",
    NUM_3: "3",
    NUM_4: "4",
    NUM_5: "5",
    NUM_6: "6",
    NUM_7: "7",
    NUM_8: "8",
    NUM_9: "9",

    // Numpad Operators
    NUM_ADD: "+",
    NUM_SUBTRACT: "-",
    NUM_MULTIPLY: "*",
    NUM_DIVIDE: "/",
    NUM_PERIOD: ".",

    // Function Keys
    F1: "F1",
    F2: "F2",
    F3: "F3",
    F4: "F4",
    F5: "F5",
    F6: "F6",
    F7: "F7",
    F8: "F8",
    F9: "F9",
    F10: "F10",
    F11: "F11",
    F12: "F12",
    F13: "F13",
    F14: "F14",
    F15: "F15",
    F16: "F16",
    F17: "F17",
    F18: "F18",
    F19: "F19",
    F20: "F20",
    F21: "F21",
    F22: "F22",
    F23: "F23",
    F24: "F24",
    F25: "F25",
    F26: "F26",
    F27: "F27",
    F28: "F28",
    F29: "F29",
    F30: "F30",
    F31: "F31",
    F32: "F32",
    F33: "F33",
    F34: "F34",
    F35: "F35",

    // Arrow Keys
    UP: "ArrowUp",
    DOWN: "ArrowDown",
    LEFT: "ArrowLeft",
    RIGHT: "ArrowRight",

    // Control Keys
    SPACE: " ",
    ENTER: "Enter",
    KP_ENTER: "Enter",
    ESCAPE: "Escape",
    TAB: "Tab",
    BACKTAB: "Tab",
    BACKSPACE: "Backspace",
    INSERT: "Insert",
    DELETE: "Delete",
    HOME: "Home",
    END: "End",
    PAGE_UP: "PageUp",
    PAGE_DOWN: "PageDown",
    PAUSE: "Pause",
    PRINT: "PrintScreen",
    CLEAR: "Clear",
    MENU: "ContextMenu",
    SYSREQ: "PrintScreen",
    HYPER: "Hyper",
    HELP: "Help",
    BACK: "BrowserBack",
    FORWARD: "BrowserForward",
    STOP: "BrowserStop",
    REFRESH: "BrowserRefresh",

    // Modifier Keys
    SHIFT: "Shift",
    LSHIFT: "Shift",
    RSHIFT: "Shift",
    CTRL: "Control",
    LCTRL: "Control",
    RCTRL: "Control",
    ALT: "Alt",
    LALT: "Alt",
    RALT: "Alt",
    META: "Meta",
    LMETA: "Meta",
    RMETA: "Meta",

    // Lock Keys
    CAPS_LOCK: "CapsLock",
    NUM_LOCK: "NumLock",
    SCROLL_LOCK: "ScrollLock",

    // Punctuation & Symbols
    EXCLAM: "!",
    QUOTEDBL: "\"",
    NUMBER_SIGN: "#",
    DOLLAR: "$",
    PERCENT: "%",
    AMPERSAND: "&",
    APOSTROPHE: "'",
    PAREN_LEFT: "(",
    PAREN_RIGHT: ")",
    ASTERISK: "*",
    PLUS: "+",
    COMMA: ",",
    MINUS: "-",
    PERIOD: ".",
    SLASH: "/",
    COLON: ":",
    SEMICOLON: ";",
    LESS: "<",
    EQUAL: "=",
    GREATER: ">",
    QUESTION: "?",
    AT: "@",
    BRACKET_LEFT: "[",
    BACKSLASH: "\\",
    BRACKET_RIGHT: "]",
    CIRCUM: "^",
    UNDERSCORE: "_",
    QUOTE_LEFT: "`",
    BRACE_LEFT: "{",
    BAR: "|",
    BRACE_RIGHT: "}",
    TILDE: "~",
    YEN: "¥",
    SECTION: "§",

    // Volume & Media Keys
    VOLUME_DOWN: "AudioVolumeDown",
    VOLUME_MUTE: "AudioVolumeMute",
    VOLUME_UP: "AudioVolumeUp",
    MEDIA_PLAY: "MediaPlayPause",
    MEDIA_STOP: "MediaStop",
    MEDIA_PREVIOUS: "MediaTrackPrevious",
    MEDIA_NEXT: "MediaTrackNext",
    MEDIA_RECORD: "MediaRecord",

    // Browser & Launch Keys
    HOMEPAGE: "BrowserHome",
    FAVORITES: "BrowserFavorites",
    SEARCH: "BrowserSearch",
    STANDBY: "Standby",
    OPEN_URL: "LaunchApplication1",
    LAUNCH_MAIL: "LaunchMail",
    LAUNCH_MEDIA: "LaunchMediaPlayer"
};


///////////////////
// Key Resolver //
///////////////////

// Converts a KEY name (e.g. "F8") into the DOM e.key string — use when
// comparing a stored bind name directly against a KeyboardEvent:
//   if (bind_key && e.key === window.to_key(bind_key)) { ... }
window.to_key = (key) => {
    if (!key) return null;
    return window.KEY[String(key).toUpperCase()] ?? key;
};