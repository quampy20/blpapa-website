// Mobile navigation disclosure.
//
// Progressive enhancement: with JS off the nav is a plain list that the CSS
// shows from 64em up, and the toggle button never appears on desktop. On small
// screens without JS the menu stays closed, so the footer carries a full link
// list as the no-JS path.

const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');

if (toggle && nav) {
  const label = toggle.querySelector('.nav-toggle__label');

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Close' : 'Menu';
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Escape closes and returns focus to the control that opened it.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  // Reset state when the viewport crosses into the desktop layout, so a menu
  // left open on a phone does not strand `is-open` on a wide screen.
  const desktop = window.matchMedia('(min-width: 64em)');
  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}
