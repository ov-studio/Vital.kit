export const text  = (v) => (typeof v === 'string' ? v.trim() : '');
export const link  = (v) => (/^https?:\/\//i.test(text(v)) ? text(v) : null);
export const image = (v) => (/^https:\/\//i.test(text(v)) ? text(v) : null);
export const slots = (total, used) => Array.from({ length: Math.max(0, total - used) }, (_, i) => i);
