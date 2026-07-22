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
window.addEventListener('keydown', (e) => {
    const blocked_keys = new Set(['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']);
    if (blocked_keys.has(e.key)) { e.preventDefault(); }
    if (e.ctrlKey || e.metaKey) {
        const blocked_combos = new Set(['KeyR', 'KeyU', 'KeyP', 'KeyF', 'KeyG']);
        if (blocked_combos.has(e.code)) { e.preventDefault(); }
    }
}, true);


// Disables the browser's native right-click context menu to prevent
// clients from accessing browser internals via the webview.
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
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


// Godot input forwarding.
//
// vsdk_forward_input is set/cleared exclusively by the C++ Webview wrapper
// via eval(). Only one webview owns input at a time — the C++ input_forwarder
// is the single source of truth. All listeners are always registered so that
// the flag can be toggled without re-injecting scripts.
window.vsdk_forward_input = false;

window.addEventListener('mousemove', (e) => {
    if (!window.vsdk_forward_input) return;
    window.ipc.postMessage(JSON.stringify({
        type: '_mouse_move',
        x: e.clientX,
        y: e.clientY,
        movementX: e.movementX,
        movementY: e.movementY,
        button: e.button
    }));
});

window.addEventListener('mousedown', (e) => {
    if (!window.vsdk_forward_input) return;
    window.ipc.postMessage(JSON.stringify({
        type: '_mouse_down',
        x: e.clientX,
        y: e.clientY,
        button: e.button
    }));
});

window.addEventListener('mouseup', (e) => {
    if (!window.vsdk_forward_input) return;
    window.ipc.postMessage(JSON.stringify({
        type: '_mouse_up',
        x: e.clientX,
        y: e.clientY,
        button: e.button
    }));
});

window.addEventListener('wheel', (e) => {
    if (!window.vsdk_forward_input) return;
    window.ipc.postMessage(JSON.stringify({
        type: '_mouse_wheel',
        x: e.clientX,
        y: e.clientY,
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
        alt: e.altKey,
        meta: e.metaKey
    }));
});

window.addEventListener('keydown', (e) => {
    if (!window.vsdk_forward_input) return;
    const modifier = ["Alt", "Shift", "Control", "Meta"].includes(e.key);
    window.ipc.postMessage(JSON.stringify({
        type: '_key_down',
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        shift: modifier ? false : e.shiftKey,
        ctrl: modifier ? false : e.ctrlKey,
        alt: modifier ? false : e.altKey,
        meta: modifier ? false : e.metaKey
    }));
});

window.addEventListener('keyup', (e) => {
    if (!window.vsdk_forward_input) return;
    const modifier = ["Alt", "Shift", "Control", "Meta"].includes(e.key);
    window.ipc.postMessage(JSON.stringify({
        type: '_key_up',
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        shift: modifier ? false : e.shiftKey,
        ctrl: modifier ? false : e.ctrlKey,
        alt: modifier ? false : e.altKey,
        meta: modifier ? false : e.metaKey
    }));
});