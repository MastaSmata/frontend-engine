import { formatPrice, icon } from '../components/shared.js';

const STORAGE_KEY = 'elice-cart';
let cart = [];
let catalog = [];
let notify = () => {};

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
function getCount() { return cart.reduce((total, item) => total + item.quantity, 0); }
function getTotal() { return cart.reduce((total, item) => total + item.price * item.quantity, 0); }

export function initCart(products, showNotification) {
  catalog = products;
  notify = showNotification;
  try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { cart = []; }
  renderCart();
  document.addEventListener('click', handleClick);
}

export function addToCart(productId, quantity = 1) {
  const product = catalog.find((item) => item.id === productId);
  if (!product) return;
  const existing = cart.find((item) => item.id === productId);
  if (existing) existing.quantity += quantity;
  else cart.push({ id: product.id, name: product.name, price: product.price, color: product.color, accent: product.accent, image: product.image, quantity });
  save();
  renderCart();
  notify(`${product.name} added to your bag.`);
  openCart();
}

function updateQuantity(productId, delta) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter((entry) => entry.id !== productId);
  save();
  renderCart();
}

function removeItem(productId) {
  cart = cart.filter((entry) => entry.id !== productId);
  save();
  renderCart();
}

function handleClick(event) {
  const addButton = event.target.closest('[data-add-to-cart]');
  if (addButton) { event.preventDefault(); event.stopPropagation(); addToCart(addButton.dataset.addToCart, 1); return; }
  const quantityButton = event.target.closest('[data-cart-quantity]');
  if (quantityButton) updateQuantity(quantityButton.dataset.id, Number(quantityButton.dataset.cartQuantity));
  const removeButton = event.target.closest('[data-cart-remove]');
  if (removeButton) { removeItem(removeButton.dataset.cartRemove); notify('Item removed from your bag.'); }
  if (event.target.closest('[data-cart-open]')) openCart();
  if (event.target.closest('[data-cart-close]') || event.target.closest('[data-cart-overlay]')) closeCart();
  if (event.target.closest('[data-cart-checkout]')) notify('Checkout is ready for your next step — thanks for shopping small.');
}

function renderCart() {
  const countNodes = document.querySelectorAll('[data-cart-count]');
  countNodes.forEach((node) => { node.textContent = getCount(); node.hidden = getCount() === 0; });
  const itemsNode = document.querySelector('[data-cart-items]');
  const summaryNode = document.querySelector('[data-cart-summary]');
  if (!itemsNode || !summaryNode) return;
  if (!cart.length) {
    itemsNode.innerHTML = '<div class="cart-empty"><div class="empty-spark">✦</div><h3>Your bag is feeling light.</h3><p>Add a few little rituals and we’ll keep them safe here.</p><a class="button button--outline" href="/src/pages/collection.html" data-cart-close>Shop products</a></div>';
    summaryNode.innerHTML = '';
    return;
  }
  itemsNode.innerHTML = cart.map((item) => {
    const catalogProduct = catalog.find((product) => product.id === item.id);
    const image = item.image || catalogProduct?.image;
    return `
    <div class="cart-item">
      <div class="cart-item-art" style="--item-bg:${item.color};"><div class="product-art product-art--image" style="--art-bg:${item.color};"><img class="product-image" src="${image}" alt="${item.name} product image" /></div></div>
      <div class="cart-item-info"><h3>${item.name}</h3><p>${formatPrice(item.price)} · ${item.quantity} ${item.quantity === 1 ? 'item' : 'items'}</p><div class="cart-item-controls"><button type="button" data-cart-quantity="-1" data-id="${item.id}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-cart-quantity="1" data-id="${item.id}" aria-label="Increase quantity">+</button><button type="button" data-cart-remove="${item.id}" aria-label="Remove ${item.name}">×</button></div></div>
      <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
    </div>
  `;
  }).join('');
  const total = getTotal();
  const freeShippingThreshold = 50000;
  summaryNode.innerHTML = `<div class="cart-total"><span>Subtotal</span><span>${formatPrice(total)}</span></div><div class="cart-checkout-options"><button class="button cart-checkout cart-checkout--whatsapp" type="button" data-cart-checkout data-checkout-method="whatsapp"><span class="checkout-brand">${icon.whatsapp}</span><span>Checkout - Whatsapp</span><strong>${formatPrice(total)}</strong><span class="checkout-arrow">↗</span></button><button class="button cart-checkout cart-checkout--mastercard" type="button" data-cart-checkout data-checkout-method="mastercard"><span class="checkout-brand">${icon.mastercard}</span><span>Checkout - Debit Card</span><strong>${formatPrice(total)}</strong></button></div><p class="cart-shipping-note">${total >= freeShippingThreshold ? 'You unlocked free shipping ✦' : `Add ${formatPrice(freeShippingThreshold - total)} for free shipping`}</p>`;
}

function openCart() {
  const drawer = document.querySelector('[data-cart-drawer]');
  const overlay = document.querySelector('[data-cart-overlay]');
  if (!drawer || !overlay) return;
  drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); overlay.classList.add('is-open'); document.body.classList.add('is-locked');
}

function closeCart() {
  const drawer = document.querySelector('[data-cart-drawer]');
  const overlay = document.querySelector('[data-cart-overlay]');
  if (!drawer || !overlay) return;
  drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); overlay.classList.remove('is-open'); document.body.classList.remove('is-locked');
}
