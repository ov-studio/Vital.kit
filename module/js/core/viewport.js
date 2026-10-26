/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: core: viewport.js
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 26/10/2026
     Desc: Viewport Utils
----------------------------------------------------------------*/


/////////////////////
// Core: Viewport //
/////////////////////

// Fullscreen webviews (flagged by Vital.sandbox via window.vsdk_fullscreen) are
// UI overlays that fill the whole window and never scroll at document level.
// Without this, the native 15px page scrollbar eats the right edge whenever
// content overflows by a pixel. Inner scroll containers are unaffected.
(() => {
    const apply = () => {
        if (window.vsdk_fullscreen !== true) return;
        if (document.getElementById('vital-kit-viewport')) return;
        const style = document.createElement('style');
        style.id = 'vital-kit-viewport';
        style.textContent = `
            html, body { overflow: hidden !important; scrollbar-width: none; }
            html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; width: 0; height: 0; }
        `;
        (document.head || document.documentElement).appendChild(style);
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
    else apply();
})();
