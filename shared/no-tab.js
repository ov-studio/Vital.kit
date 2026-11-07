// Disables Tab-driven focus traversal for the whole page.
// Capture phase (the `true` third arg) means this fires before React or any element's
// own handlers see the event, so Tab is suppressed no matter what gets added later.
// Imported once per app entry.

document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') e.preventDefault();
}, true);
