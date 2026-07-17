/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: core: input.js
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 14/09/2022
     Desc: Input Utils
----------------------------------------------------------------*/


//////////////////
// Core: Input //
//////////////////

// Keyboard utilities and browser accelerator key blocking.
//
// Accelerator blocking: prevents browser-native actions (reload, devtools,
// print, find, view-source) from firing when the webview is focused.
// The keydown event still propagates — other listeners are unaffected.

window.addEventListener('keydown', function (e) {
    const blocked_keys = new Set(['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']);
    if (blocked_keys.has(e.key)) { e.preventDefault(); }
    if (e.ctrlKey || e.metaKey) {
        const blocked_combos = new Set(['KeyR', 'KeyU', 'KeyP', 'KeyF', 'KeyG']);
        if (blocked_combos.has(e.code)) { e.preventDefault(); }
    }
}, true);


// Key name lookup utility for comparing stored bind names against DOM events.
//
// window.to_key(name) → DOM e.key string for a given KEY enum name,
//   e.g. window.to_key("F8") === "F8", window.to_key("SPACE") === " "
//   Returns null for unknown names. Use when comparing a stored bind
//   name directly against a KeyboardEvent:
//     if (bind_key && e.key === window.to_key(bind_key)) { ... }

window.to_key = (key) => {
    if (!key) return null;
    return window.KEY[String(key).toUpperCase()] ?? key;
};