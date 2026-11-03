import site from '@brand/site.json';
import { createProductRepository, loadJson } from '../capabilities/catalog/catalog.js';
import { createCartStore } from '../capabilities/cart/cart-store.js';
import { createCheckoutOrchestrator, createDebitCardGateway, createWhatsAppGateway } from '../capabilities/checkout/checkout.js';
import { installImageFallback } from '../capabilities/media/image-fallback.js';
import { formatMoney } from '../components/commerce/money.js';
import { escapeHtml } from '../components/template-core.js';
import { collectComponentStyles, mountComponents, renderComponent } from '../engine/component-registry.js';
import { createRouteComposition } from '../engine/route-composition.js';
import '../styles/base.css';

const app = document.querySelector('#app');
installImageFallback();
const pathname = window.location.pathname;
const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
const route = site.routes[pathname] ? pathname : (site.routes[normalizedPath] ? normalizedPath : (site.routes['/'] ? '/' : Object.keys(site.routes)[0]));
const routeConfig = site.routes[route];
const datasets = {};
const datasetEntries = Object.entries(site.data || {});
await Promise.all(datasetEntries.map(async ([name, path]) => {
  if (name === 'products') {
    const repository = createProductRepository({ path });
    datasets[name] = await repository.load();
  } else {
    datasets[name] = await loadJson(path, { label: name, expected: 'any' });
  }
}));
const products = Array.isArray(datasets.products) ? datasets.products : [];

const productId = new URLSearchParams(window.location.search).get('id');
const selectedProduct = products.find((product) => product.id === productId) || products[0] || null;
const context = { ...site, datasets, products, selectedProduct, route };

const theme = site.theme?.tokens || {};
for (const [name, value] of Object.entries(theme)) document.documentElement.style.setProperty(name.startsWith('--') ? name : `--${name}`, value);

const composition = createRouteComposition(site.routes, (id, props, renderContext) => renderComponent(id, props, renderContext));
const rendered = composition.render(route, context);
app.innerHTML = rendered;
document.title = routeConfig.title || site.site?.title || site.site?.brand || 'GroundAQ site';
const description = document.querySelector('meta[name="description"]');
if (description && routeConfig.description) description.content = routeConfig.description;

const selectedStyles = collectComponentStyles(routeConfig.components || [], context);
const styleElement = document.createElement('style');
styleElement.dataset.componentStyles = '';
styleElement.textContent = selectedStyles.map(({ css }) => css).join('\n');
document.head.append(styleElement);

const currencySite = site.site || {};
const cart = createCartStore({
  storageKey: currencySite.storageKey || `${site.id || currencySite.brand || 'groundaq'}-cart`,
  normalize: (product, options, qty) => ({
    ...options,
    id: product.id,
    title: product.title || product.name,
    price: product.price,
    image: product.card || product.image,
    options,
    qty,
  }),
});
const notify = (message) => {
  if (document.querySelector('[data-toast]')) window.dispatchEvent(new CustomEvent('groundaq:notice', { detail: { message } }));
  else window.alert(message);
};
const checkout = createCheckoutOrchestrator({
  providers: [
    createWhatsAppGateway({ phoneNumber: currencySite.whatsappNumber, brand: currencySite.brand, money: (value) => formatMoney(value, currencySite) }),
    createDebitCardGateway(),
  ],
  notify,
});

const renderCart = () => {
  const items = cart.getItems();
  document.querySelectorAll('[data-cart-count]').forEach((node) => { node.textContent = String(cart.count()); });
  document.querySelectorAll('[data-cart-items]').forEach((node) => {
    node.innerHTML = items.map((item) => `<div class="cart-line"><img src="${escapeHtml(item.image || '')}" alt=""><div><strong>${escapeHtml(item.title)}</strong><span>${formatMoney(item.price, currencySite)}</span></div><button type="button" data-remove-cart="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.title)}">×</button></div>`).join('') || '<p class="cart-empty">Your bag is empty.</p>';
  });
  document.querySelectorAll('[data-cart-items]').forEach((node) => {
    items.forEach((item, index) => {
      const row = node.querySelectorAll('.cart-line')[index];
      if (!row) return;
      const removeButton = row.querySelector('[data-remove-cart]');
      if (removeButton) removeButton.dataset.removeCartIndex = String(index);
      const selectedOptions = Object.entries(item.options || {}).filter(([, value]) => value);
      if (selectedOptions.length) {
        const optionLabel = document.createElement('span');
        optionLabel.textContent = selectedOptions.map(([name, value]) => name + ': ' + value).join(' · ');
        row.children[1].append(optionLabel);
      }
    });
  });
  document.querySelectorAll('[data-cart-subtotal]').forEach((node) => { node.textContent = formatMoney(cart.total(), currencySite); });
};

mountComponents(app, { ...context, cart });
cart.subscribe(renderCart);
renderCart();

const applyProductQuery = (searchValue, categoryValue) => {
  const query = String(searchValue || '').trim().toLowerCase();
  const category = String(categoryValue || '').trim().toLowerCase();
  document.querySelectorAll('[data-product-grid] [data-product-id]').forEach((card) => {
    const matchesSearch = !query || card.textContent.toLowerCase().includes(query);
    const matchesCategory = !category || String(card.dataset.productCategory || '').toLowerCase().includes(category);
    card.hidden = !(matchesSearch && matchesCategory);
  });
};
const params = new URLSearchParams(window.location.search);
applyProductQuery(params.get('search'), params.get('category'));

document.addEventListener('click', (event) => {
  const add = event.target.closest('[data-add-to-cart]');
  if (add) {
    const product = products.find((item) => item.id === add.dataset.addToCart);
    if (product) {
      const detail = add.closest('[data-component-id="product-detail.standard"]');
      const selectedOptions = detail ? [...detail.querySelectorAll('[data-option-group].is-selected')] : [];
      const options = Object.fromEntries(selectedOptions.map((button) => [button.dataset.optionGroup, button.dataset.optionValue]));
      const quantityInput = detail?.querySelector('[data-product-quantity]');
      const quantity = Math.max(1, Math.floor(Number(quantityInput?.value) || 1));
      cart.add(product, quantity, options);
      document.querySelector('[data-cart-drawer]')?.classList.add('is-open');
    }
  }
  const option = event.target.closest('[data-option-group][data-option-value]');
  if (option) {
    option.parentElement.querySelectorAll('[data-option-group]').forEach((button) => {
      button.classList.remove('is-selected');
      button.setAttribute('aria-pressed', 'false');
    });
    option.classList.add('is-selected');
    option.setAttribute('aria-pressed', 'true');
  }
  if (event.target.closest('[data-open-cart]')) document.querySelector('[data-cart-drawer]')?.classList.add('is-open');
  if (event.target.closest('[data-close-cart]')) document.querySelector('[data-cart-drawer]')?.classList.remove('is-open');
  const remove = event.target.closest('[data-remove-cart]');
  if (remove) {
    const index = Number(remove.dataset.removeCartIndex);
    if (Number.isInteger(index)) cart.removeAt(index);
    else cart.remove(remove.dataset.removeCart);
  }
  if (event.target.closest('[data-checkout]')) checkout.begin(currencySite.whatsappNumber ? 'checkout.whatsapp' : 'checkout.debit-card', { cart });
});

document.addEventListener('input', (event) => {
  if (!event.target.matches('[data-product-search]')) return;
  applyProductQuery(event.target.value, params.get('category'));
});

document.addEventListener('submit', (event) => {
  if (!event.target.matches('[data-product-search-form]')) return;
  event.preventDefault();
  const input = event.target.querySelector('[data-product-search]');
  const query = input?.value.trim();
  const collectionPath = currencySite.collectionPath || 'collection.html';
  const destination = new URL(collectionPath, window.location.href);
  if (query) destination.searchParams.set('search', query);
  else destination.searchParams.delete('search');
  window.location.href = destination.href;
});

document.addEventListener('submit', (event) => {
  if (!event.target.matches('[data-contact-form], [data-newsletter-form]')) return;
  event.preventDefault();
  event.target.innerHTML = '<p class="form-success">Thank you. We will be in touch soon.</p>';
});
