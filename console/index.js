const LOG_DEBOUNCE = 3000;
const LOG_LIMIT = 500;
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

function Godot_To_Key(key) {
    if (!key) return null;
    return GODOT_KEY[key.toLowerCase()] ?? key;
}

const TrashIcon = ({ size = 24, strokeWidth = 2, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
);

const RotateIcon = ({ size = 24, strokeWidth = 2, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
    </svg>
);

const make_key = (type, msg) => `${type}:${msg}`;
const rgb_to_css = (rgb) => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
const rgb_to_css_alpha = (rgb, a) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
const rgb_lighten = (rgb, factor) => [
    Math.round(rgb[0] + (255 - rgb[0]) * factor),
    Math.round(rgb[1] + (255 - rgb[1]) * factor),
    Math.round(rgb[2] + (255 - rgb[2]) * factor),
];

const parse_lines = (message) => {
    if (typeof message !== 'string') return [{ is_quote: false, text: String(message) }];
    const raw = message.split('\n').map(line => {
        const match = line.match(/^>\s?(.*)/);
        if (match) return { is_quote: true, text: match[1] };
        return { is_quote: false, text: line };
    });
    return raw.reduce((acc, line) => {
        const prev = acc[acc.length - 1];
        if (prev && prev.is_quote && line.is_quote) prev.text += '\n' + line.text;
        else acc.push({ ...line });
        return acc;
    }, []);
};

const parse_segments = (text) => {
    const segments = [];
    const regex = /`([^`]+)`/g;
    let last = 0, match;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > last) segments.push({ is_code: false, text: text.slice(last, match.index) });
        segments.push({ is_code: true, text: match[1] });
        last = match.index + match[0].length;
    }
    if (last < text.length) segments.push({ is_code: false, text: text.slice(last) });
    return segments;
};

const FilterButton = ({ type, label, count, is_active, on_click, color }) => (
    <div
        className={`filter ${is_active ? 'active' : ''}`}
        data-type={type}
        onClick={on_click}
        style={color ? { color: rgb_to_css(color), backgroundColor: rgb_to_css_alpha(color, 0.1) } : {}}
    >
        <div className="filter-dot"></div>
        {label}
        {count > 0 && <span className="filter-count"> ({count})</span>}
    </div>
);

const ActionButton = ({ icon: Icon, label, on_click }) => (
    <button className="icon-btn icon-btn-labeled" onClick={on_click}>
        <Icon size={12} strokeWidth={2}/>
        <span className="btn-label">{label}</span>
    </button>
);

const LogText = ({ text, color }) => {
    const segments = parse_segments(text);
    const lightened = color ? rgb_lighten(color, 0.4) : null;
    return segments.map((seg, i) =>
        seg.is_code
            ? <code key={i} className="log-code" style={lightened ? {
                color: rgb_to_css(lightened),
                background: rgb_to_css_alpha(lightened, 0.025),
                borderColor: rgb_to_css_alpha(lightened, 0.3),
            } : {}}>{seg.text}</code>
            : <React.Fragment key={i}>{seg.text}</React.Fragment>
    );
};

const LogRow = ({ type, badge, color, timestamp, message, repeat_count, is_hidden }) => {
    const lines = parse_lines(message);
    const is_multiline = lines.length > 1;
    return (
        <div
            className={`log-row ${type} ${is_hidden ? 'hidden' : ''} ${is_multiline ? 'log-row-multiline' : ''}`}
            style={{ color: rgb_to_css(rgb_lighten(color, 0.05)) }}
        >
            <span className="log-ts">{timestamp}</span>
            <span className="log-level" style={{ color: rgb_to_css(color) }}>{badge}</span>
            <span className="log-msg">
                {lines.map((line, i) => (
                    <span key={i} className={line.is_quote ? 'log-line log-quote' : 'log-line'}>
                        <LogText text={line.text} color={color}/>
                    </span>
                ))}
            </span>
            {repeat_count > 1 && <span className="badge visible">x{repeat_count}</span>}
        </div>
    );
};