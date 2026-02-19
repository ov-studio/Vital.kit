const LOG_GROUP_MS = 5000;

const LOG_LEVELS = {
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