/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: util: color.js
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 14/09/2022
     Desc: Color Utils
----------------------------------------------------------------*/


//////////////////
// Util: Color //
//////////////////

// Color conversion utilities for use in webview UI code.
// All functions operate on rgb arrays of the form [r, g, b] (0–255).
//
// window.rgb_to_css([r,g,b])           → "rgb(r, g, b)"
// window.rgb_to_css_alpha([r,g,b], a)  → "rgba(r, g, b, a)"
// window.rgb_lighten([r,g,b], factor)  → lightened [r, g, b] array

window.rgb_to_css = (rgb) => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

window.rgb_to_css_alpha = (rgb, a) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;

window.rgb_lighten = (rgb, factor) => [
    Math.round(rgb[0] + (255 - rgb[0]) * factor),
    Math.round(rgb[1] + (255 - rgb[1]) * factor),
    Math.round(rgb[2] + (255 - rgb[2]) * factor),
];
