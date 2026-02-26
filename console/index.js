const { useState, useEffect, useRef, useCallback, useMemo } = React;

const TrashIcon = ({ size = 24, strokeWidth = 2, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const RotateIcon = ({ size = 24, strokeWidth = 2, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
    </svg>
);

const make_key = (type, msg) => {
    return `${type}:${msg}`;
};

const get_sorted_level_types = () => {
    return Object.entries(LOG_LEVELS)
        .sort(([, a], [, b]) => a.priority - b.priority)
        .map(([type]) => type);
}

const parse_lines = (message) => {
    if (typeof message !== 'string') return [{ is_quote: false, text: String(message) }];
    const raw = message.split('\n').map(line => {
        const match = line.match(/^>\s?(.*)/);
        if (match) return { is_quote: true, text: match[1] };
        return { is_quote: false, text: line };
    });
    // merge consecutive quote lines into one block
    return raw.reduce((acc, line) => {
        const prev = acc[acc.length - 1];
        if (prev && prev.is_quote && line.is_quote) {
            prev.text += '\n' + line.text;
        } else {
            acc.push({ ...line });
        }
        return acc;
    }, []);
};

const FilterButton = ({ type, label, count, is_active, on_click, label_color, bg_color }) => (
    <div
        className={`filter ${is_active ? 'active' : ''}`}
        data-type={type}
        onClick={on_click}
        style={is_active ? (type === 'all' ? { color: 'var(--fg)', backgroundColor: 'var(--accent-bg)' } : { color: label_color, backgroundColor: bg_color }) : {}}
    >
        <div className="filter-dot"></div>
        {label}
        {count > 0 && <span className="filter-count"> ({count})</span>}
    </div>
);

const ActionButton = ({ icon: Icon, label, on_click }) => (
    <button className="icon-btn icon-btn-labeled" onClick={on_click}>
        <Icon size={12} strokeWidth={2} />
        <span className="btn-label">{label}</span>
    </button>
);

const LogRow = ({ type, timestamp, message, repeat_count, is_hidden }) => {
    const level_config = LOG_LEVELS[type];
    const lines = parse_lines(message);
    const is_multiline = lines.length > 1;
    return (
        <div className={`log-row ${type} ${is_hidden ? 'hidden' : ''} ${is_multiline ? 'log-row-multiline' : ''}`} style={level_config ? { color: level_config.label_color } : {}}>
            <span className="log-ts">{timestamp}</span>
            <span className="log-level">{level_config?.badge ?? type.toUpperCase()}</span>
            <span className="log-msg">
                {lines.map((line, i) => (
                    <span key={i} className={line.is_quote ? 'log-line log-quote' : 'log-line'}>
                        {line.text}
                    </span>
                ))}
            </span>
            {repeat_count > 1 && <span className="badge visible">x{repeat_count}</span>}
        </div>
    );
};