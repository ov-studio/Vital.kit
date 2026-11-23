/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: core: guard.js
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 23/11/2026
     Desc: Guard Utils
----------------------------------------------------------------*/


//////////////////
// Core: Guard //
//////////////////

// Accelerator blocking: prevents browser-native actions (reload, devtools,
// print, find, view-source) from firing when the webview is focused.
/*
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


// Navigation blocking: the mouse side buttons (back / forward), Alt+Left / Alt+Right and the browser back / forward
// keys must not walk the webview's history, otherwise the page is swapped for the previous document (the UI vanishes,
// and comes back without its state).
['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'auxclick'].forEach((type) => {
    window.addEventListener(type, (e) => {
        if (e.button === 3 || e.button === 4) { e.preventDefault(); }
    }, true);
});

window.addEventListener('keydown', (e) => {
    if ((e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) || e.key === 'BrowserBack' || e.key === 'BrowserForward') {
        e.preventDefault();
    }
}, true);


// Last line of defence (the browser may still handle the side buttons natively): keeps the current entry on top of
// the history, so a back / forward lands on the same page again.
try {
    history.replaceState({ vsdk: 0 }, '');
    history.pushState({ vsdk: 1 }, '');
    window.addEventListener('popstate', () => {
        try { history.pushState({ vsdk: 1 }, ''); } catch (_) {}
    });
} catch (_) {}
*/
