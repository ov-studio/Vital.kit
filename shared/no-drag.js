// Disables native dragging everywhere (image ghosts, links, selected text) and
// stops files dropped onto the webview from navigating away from the page.
// Imported once per app entry, covers every element including ones added later.
const stop = (e) => e.preventDefault();

document.addEventListener('dragstart', stop, true);
document.addEventListener('dragover', stop, true);
document.addEventListener('drop', stop, true);

// CSS side: -webkit-user-drag is not inherited, so it has to be set on every element
const style = document.createElement('style');
style.textContent = '*, *::before, *::after { -webkit-user-drag: none; user-drag: none; }';
document.head.appendChild(style);
