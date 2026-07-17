export const make_key = (type, msg) => `${type}:${msg}`;

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