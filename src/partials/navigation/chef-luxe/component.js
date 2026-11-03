export function mount(root) {
  const toggle = root.querySelector('[data-chef-menu-toggle]');
  const menu = root.querySelector('[data-chef-menu]');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.classList.toggle('is-open', open);
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    menu.classList.remove('is-open');
  }));
}
