export function mount(root) {
  const header = root.querySelector('.navigation');
  const toggle = root.querySelector('[data-menu-toggle]');
  const nav = root.querySelector('[data-menu]');
  if (!header || !toggle || !nav) return;

  const close = () => {
    header.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  };
  const setOpen = (open) => {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  window.matchMedia?.('(min-width: 701px)').addEventListener?.('change', close);
}
