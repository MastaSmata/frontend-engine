export function initNavigation() {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const categoryWrap = document.querySelector('[data-category-wrap]');
  const categoryToggle = document.querySelector('[data-category-toggle]');
  const mobileCategoryWrap = document.querySelector('[data-mobile-category-wrap]');
  const mobileCategoryToggle = document.querySelector('[data-mobile-category-toggle]');
  const categoryButtons = document.querySelectorAll('[data-category]');
  const searchInputs = document.querySelectorAll('[data-global-search], [data-mobile-search]');

  menuToggle?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  categoryToggle?.addEventListener('click', () => categoryWrap.classList.toggle('is-open'));
  mobileCategoryToggle?.addEventListener('click', () => mobileCategoryWrap.classList.toggle('is-open'));
  categoryButtons.forEach((button) => button.addEventListener('click', () => {
    categoryWrap?.classList.remove('is-open');
    mobileCategoryWrap?.classList.remove('is-open');
    mobileMenu?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    window.dispatchEvent(new CustomEvent('catalog:filter', { detail: { category: button.dataset.category, query: '' } }));
  }));
  searchInputs.forEach((input) => input.addEventListener('input', () => {
    searchInputs.forEach((other) => { if (other !== input) other.value = input.value; });
    window.dispatchEvent(new CustomEvent('catalog:filter', { detail: { query: input.value, category: 'all' } }));
  }));
}
