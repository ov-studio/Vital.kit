/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: util: bridge.js
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 14/09/2022
     Desc: Bridge Utils
----------------------------------------------------------------*/


//////////////////////
// Globals: Bridge //
//////////////////////

window.bridge = {
    godot_to_key(key) {
        if (!key) return null;
        return KEY[key.toUpperCase()] ?? key;
    },

    make_key: (type, msg) => `${type}:${msg}`,

    rgb_to_css: (rgb) => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,

    rgb_to_css_alpha: (rgb, a) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`,

    rgb_lighten: (rgb, factor) => [
        Math.round(rgb[0] + (255 - rgb[0]) * factor),
        Math.round(rgb[1] + (255 - rgb[1]) * factor),
        Math.round(rgb[2] + (255 - rgb[2]) * factor),
    ],

    parse_lines(message) {
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
        });
        return groups;
    },

    parse_segments(text) {
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
    },
};
