// CONSTANTS
const GROUP_MS = 5000;
const { useState, useEffect, useRef, useCallback, useMemo } = React;
const LEVELS = {
    info: {
        label: 'Info',
        badge: 'INFO',
        priority: 1,
        label_color: 'hsl(220 13% 78%)',
        bg_color: 'hsl(220 13% 78%/0.1)'
    },
    warn: {
        label: 'Warn',
        badge: 'WARN',
        priority: 2,
        label_color: 'hsl(38 92% 66%)',
        bg_color: 'hsl(38 92% 66%/0.1)'
    },
    error: {
        label: 'Error',
        badge: 'ERRO',
        priority: 3,
        label_color: 'hsl(0 72% 66%)',
        bg_color: 'hsl(0 72% 66%/0.1)'
    }
};

// ICONS
const Trash2 = ({ size = 24, strokeWidth = 2, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const RotateCcw = ({ size = 24, strokeWidth = 2, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);

// UTILITIES
const make_key = (type, msg) => {
    return type + '\x00' + msg
        .replace(/\d+\.\d+/g, '#')
        .replace(/\b\d+\b/g, '#')
        .replace(/\s+/g, ' ')
        .trim();
};

const get_sorted_level_types = () => {
    return Object.entries(LEVELS)
        .sort(([, a], [, b]) => a.priority - b.priority)
        .map(([type]) => type);
};

// COMPONENTS
const FilterButton = ({ type, label, count, is_active, on_click, label_color, bg_color }) => {
    const style = type === 'all'
        ? {
            color: is_active ? 'var(--fg)' : undefined,
            backgroundColor: is_active ? 'var(--accent-bg)' : undefined
        }
        : {
            color: is_active ? label_color : undefined,
            backgroundColor: is_active ? bg_color : undefined
        };

    return (
        <div
            className={`filter ${is_active ? 'active' : ''}`}
            data-type={type}
            onClick={on_click}
            style={style}
        >
            <div className="filter-dot"></div>
            {label}
            {count > 0 && <span className="filter-count"> ({count})</span>}
        </div>
    );
};

const ActionButton = ({ icon: Icon, label, on_click }) => (
    <button className="icon-btn icon-btn-labeled" onClick={on_click}>
        <Icon size={12} strokeWidth={2} />
        <span className="btn-label">{label}</span>
    </button>
);

const LogRow = ({ type, timestamp, message, repeat_count, is_hidden }) => {
    const level_config = LEVELS[type];
    const style = level_config ? { color: level_config.label_color } : {};

    return (
        <div className={`log-row ${type} ${is_hidden ? 'hidden' : ''}`} style={style}>
            <span className="log-ts">{timestamp}</span>
            <span className="log-level">{level_config?.badge ?? type.toUpperCase()}</span>
            <span className="log-msg">{message}</span>
            {repeat_count > 1 && <span className="badge visible">x{repeat_count}</span>}
        </div>
    );
};