import '../styles/main.css';
import { cartTemplate, consultTemplate, footerTemplate, formatPrice, headerTemplate, icon, productArt, reviewStars } from '../components/shared.js';
import { productCard } from '../components/product-card.js';
import { productGrid } from '../components/product-grid.js';
import { filterProducts, getProduct, loadProducts } from './products.js';
import { initCart } from './cart.js';
import { initCollectionSlideshow } from './collection.js';
import { initHomeTypewriter } from './home.js';
import { initMarquee } from './marquee.js';
import { initNavigation } from './navigation.js';
import { initNotifications } from './notifications.js';

const app = document.querySelector('#app');
const page = app?.dataset.page || 'home';
const activePage = page === 'home' ? '' : page;
let allProducts = [];
let currentFilter = { query: '', category: 'all' };
let showToast;

const homeTemplate = () => `
  <main class="site-main">
    <section class="hero" aria-label="Elice SKincare model hero"><div class="container hero-inner">
      <div class="hero-copy"><h1 aria-live="polite"><span data-home-typewriter>Good skin days on repeat</span><span class="typewriter-cursor" aria-hidden="true"></span></h1><div class="hero-note"><span class="review-avatars"><img src="/manus-storage/async-images/CuqFOhq7uM2JJLDNgx8yV7/image-2.webp" alt="Elice customer" /><img src="/manus-storage/async-images/CuqFOhq7uM2JJLDNgx8yV7/image-3.webp" alt="Elice customer" /><img src="/manus-storage/async-images/CuqFOhq7uM2JJLDNgx8yV7/image-4.webp" alt="Elice customer" /></span><span><strong>4.9/5</strong> from skin in a good mood</span></div></div><div class="hero-consult"><p>Not Sure of what to buy?</p><button class="button" type="button" data-consult-open>Consult Elice</button></div>
    </div></section>
    <div class="marquee"><div class="marquee-track"><span class="marquee-item">Small rituals</span><span class="marquee-item">Big joy</span><span class="marquee-item">Good ingredients</span><span class="marquee-item">No skin lectures</span><span class="marquee-item">Small rituals</span><span class="marquee-item">Big joy</span><span class="marquee-item">Good ingredients</span><span class="marquee-item">No skin lectures</span></div></div>
    <section class="section shop-section" id="shop"><div class="container"><div class="shop-intro"><div><p class="eyebrow">The lineup</p><h2>Meet your new shelfies.</h2></div></div><div class="filter-row" data-home-filters>${['all', 'Cleanse', 'Treat', 'Moisturize', 'Protect', 'Sets'].map((category) => `<button class="filter-chip${category === 'all' ? ' is-active' : ''}" data-home-category="${category}" type="button">${category === 'all' ? 'All favorites' : category}</button>`).join('')}</div><div class="product-grid" data-product-grid></div><div style="text-align:center;margin-top:30px"><a class="button button--outline" href="/src/pages/collection.html">See the full collection ${icon.arrow}</a></div></div></section>
    <section class="section section--tight"><div class="container about-block"><div class="about-mark"><div class="about-mark-shade"><img src="/manus-storage/async-images/WAi5J7GaCeZtV9UkAT4VwG/image-1.webp" alt="Elice skincare ritual in a colorful bathroom setting" /></div><div class="about-quote">Your routine should feel like a little exhale.</div></div><div class="about-copy"><p class="eyebrow">The Elice feeling</p><h2>Serious about skin. Never serious about ourselves.</h2><form class="consult-form consult-form--inline" data-special-package-form><h3>Fill in your details and get your special package</h3><label class="consult-field"><span>Name</span><input name="name" type="text" autocomplete="name" placeholder="Your name" required /></label><label class="consult-field"><span>Phone number</span><input name="phone" type="tel" autocomplete="tel" placeholder="Your phone number" required /></label><button class="button" type="submit">Get Special Package</button></form><a class="text-link" href="/src/pages/about.html">Read our story</a></div></div></section>
  </main>
`;

const collectionTemplate = () => `
  <main class="site-main"><section class="page-intro"><div class="container"><div class="collection-visual" data-collection-slideshow aria-label="Elice SKincare collection story"><div class="collection-slides"><figure class="collection-slide is-active" data-slide><img src="/manus-storage/async-images/sWswF3q7rRtBhglORUqJTr/image-1.webp" alt="Aqua serum bottle with glossy droplets on a lavender and cyan surface" /></figure><figure class="collection-slide" data-slide><img src="/manus-storage/async-images/sWswF3q7rRtBhglORUqJTr/image-2.webp" alt="White moisturizer jar surrounded by soft pink cream swirls" /></figure><figure class="collection-slide" data-slide><img src="/manus-storage/async-images/sWswF3q7rRtBhglORUqJTr/image-3.webp" alt="Sunny SPF tube with lilac leaves on a cyan background" /></figure></div><div class="collection-visual-shade"></div><h1 class="collection-typewriter" aria-live="polite"><span data-typewriter-text></span><span class="typewriter-cursor" data-typewriter-cursor aria-hidden="true"></span></h1><span class="collection-slide-count" data-slide-count>01 / 03</span></div></div></section><section class="section section--tight"><div class="container"><div class="collection-toolbar"><label class="collection-search">${icon.search}<input type="search" placeholder="Try “glow” or “cleanse”" data-collection-search /></label><span class="result-count" data-result-count></span></div><div class="filter-row" data-collection-filters>${['all', 'Cleanse', 'Treat', 'Moisturize', 'Protect', 'Refresh', 'Sets'].map((category) => `<button class="filter-chip${category === 'all' ? ' is-active' : ''}" data-collection-category="${category}" type="button">${category === 'all' ? 'All products' : category}</button>`).join('')}</div><div class="product-grid" data-product-grid></div></div></section></main>
`;

const productTemplate = (product) => `
  <main class="site-main"><div class="container product-detail"><div class="product-detail-art">${productArt(product, true)}</div><div class="product-detail-copy"><h1>${product.name}</h1><div class="detail-rating" aria-label="${product.rating.toFixed(1)} out of 5 stars">${reviewStars(product.rating)} <span>· ${product.rating.toFixed(1)} · loved by the Elice club</span></div><div class="detail-price">${formatPrice(product.price)}</div><p class="detail-copy">${product.description}</p><div class="detail-meta"><div class="detail-meta-row"><span>Ingredients</span><span>${product.ingredients}</span></div><div class="detail-meta-row"><span>Size</span><span>${product.size}</span></div><div class="detail-meta-row"><span>Feel</span><span>Kind, effective, never fussy</span></div></div><div class="detail-actions"><button class="button" type="button" data-add-to-cart="${product.id}">${icon.bag} Add to bag · ${formatPrice(product.price)}</button><a class="button button--outline" href="/src/pages/collection.html">Keep browsing</a></div></div></div><section class="section section--tight related-section"><div class="container"><div class="related-heading"><h2>More from ${product.category}</h2><span>More to explore</span></div><div class="related-product-rail" data-related-products aria-label="More ${product.category} products"></div></div></section></main>
`;

const aboutTemplate = () => `
  <main class="site-main"><section class="story-section"><div class="container"><p class="eyebrow">About Elice</p><h1>Skincare that brings the good energy.</h1><p>We started Elice because the bathroom shelf could use more color, more comfort, and fewer complicated rules. Our formulas are made for the beautifully ordinary bits of life — late nights, early trains, post-gym faces, and everything in between.</p></div></section><section class="section section--tight"><div class="container value-grid"><article class="value-card"><div class="value-icon">✦</div><h3>Effective, not intimidating</h3><p>Good ingredients, clear labels, and no fear-based skincare language. Your skin is not a problem to solve.</p></article><article class="value-card"><div class="value-icon">♡</div><h3>Soft on skin, softer on earth</h3><p>We choose thoughtful materials and practical sizes so the ritual feels good from first pump to last.</p></article><article class="value-card"><div class="value-icon">☼</div><h3>Joy is a real ingredient</h3><p>Color, texture, scent, and tiny moments of delight are part of the formula. Because why shouldn’t they be?</p></article></div></section><section class="section"><div class="container about-block"><div class="about-copy"><p class="eyebrow">A note from Elice</p><h2>“Take what works. Leave the pressure.”</h2><p>There is no perfect routine here. Just a collection of lovely little helpers, ready when you are.</p><a class="button" href="/src/pages/collection.html">Find your ritual ${icon.arrow}</a></div><div class="about-mark"><div class="about-quote">More glow. Less guesswork.</div></div></div></section></main>
`;

const contactTemplate = () => `
  <main class="site-main"><section class="page-intro"><div class="container"><p class="eyebrow">Say hello</p><h1>Questions, curiosities, tiny skin emergencies?</h1><p>Our inbox is a friendly place. Tell us what’s on your mind and a real Elice human will get back to you soon.</p></div></section><section class="contact-layout"><div class="container contact-layout"><div class="contact-detail"><p class="eyebrow">Find us here</p><h2>We’re in your corner.</h2><p>We usually reply within 1–2 business days, with practical answers and absolutely no judgment.</p><div class="contact-list"><div><span class="muted">Email</span><br><a href="mailto:hello@eliceskincare.com">hello@eliceskincare.com</a></div><div><span class="muted">Hours</span><br>Mon–Fri · 9am–5pm ET</div><div><span class="muted">Social</span><br><a href="https://www.instagram.com" target="_blank" rel="noreferrer">@eliceskincare</a></div></div></div><form class="contact-form" data-contact-form><div class="form-field"><label for="name">Your name</label><input id="name" name="name" required placeholder="The lovely human behind this note" /></div><div class="form-field"><label for="email">Email address</label><input id="email" type="email" name="email" required placeholder="you@example.com" /></div><div class="form-field"><label for="topic">What’s up?</label><select id="topic" name="topic"><option>Product question</option><option>Order support</option><option>Ingredient curiosity</option><option>Just saying hi</option></select></div><div class="form-field"><label for="message">Your note</label><textarea id="message" name="message" required placeholder="Tell us everything..."></textarea></div><button class="button" type="submit">Send a little note ${icon.arrow}</button></form></div></div></section></main>
`;

function renderPage() {
  const content = page === 'collection' ? collectionTemplate() : page === 'product' ? productTemplate(getProduct(allProducts, new URLSearchParams(location.search).get('id'))) : page === 'about' ? aboutTemplate() : page === 'contact' ? contactTemplate() : homeTemplate();
  app.innerHTML = `<div class="page-frame">${headerTemplate(activePage)}${content}${footerTemplate()}${consultTemplate()}${cartTemplate()}</div>`;
}

function renderGrid() {
  const grid = document.querySelector('[data-product-grid]');
  if (!grid) return;
  const visible = filterProducts(allProducts, currentFilter);
  grid.innerHTML = productGrid(page === 'home' ? visible.slice(0, 12) : visible);
  const count = document.querySelector('[data-result-count]');
  if (count) count.textContent = `${visible.length} ${visible.length === 1 ? 'product' : 'products'}`;
}

function renderRelatedProducts() {
  const rail = document.querySelector('[data-related-products]');
  if (!rail) return;
  const product = getProduct(allProducts, new URLSearchParams(location.search).get('id'));
  const related = allProducts.filter((item) => item.category === product.category && item.id !== product.id);
  rail.innerHTML = (related.length ? related : [product]).map(productCard).join('');
}

function setFilter(filter) {
  currentFilter = { ...currentFilter, ...filter };
  document.querySelectorAll('[data-home-category], [data-collection-category]').forEach((button) => button.classList.toggle('is-active', button.dataset.homeCategory === currentFilter.category || button.dataset.collectionCategory === currentFilter.category));
  renderGrid();
}

function bindPageEvents() {
  document.querySelectorAll('[data-home-category], [data-collection-category]').forEach((button) => button.addEventListener('click', () => setFilter({ category: button.dataset.homeCategory || button.dataset.collectionCategory, query: '' })));
  const collectionSearch = document.querySelector('[data-collection-search]');
  collectionSearch?.addEventListener('input', () => setFilter({ query: collectionSearch.value, category: 'all' }));
  document.querySelector('[data-contact-form]')?.addEventListener('submit', (event) => { event.preventDefault(); event.target.reset(); showToast('Thanks for your note — we’ll be in touch soon.'); });
  const consultModal = document.querySelector('[data-consult-modal]');
  const consultOverlay = document.querySelector('[data-consult-overlay]');
  const closeConsult = () => { consultModal?.classList.remove('is-open'); consultModal?.setAttribute('aria-hidden', 'true'); consultOverlay?.classList.remove('is-open'); document.body.classList.remove('is-locked'); };
  document.querySelectorAll('[data-consult-open]').forEach((trigger) => trigger.addEventListener('click', (event) => { event.preventDefault(); consultModal?.classList.add('is-open'); consultModal?.setAttribute('aria-hidden', 'false'); consultOverlay?.classList.add('is-open'); document.body.classList.add('is-locked'); consultModal?.querySelector('input')?.focus(); }));
  document.querySelectorAll('[data-consult-close]').forEach((trigger) => trigger.addEventListener('click', closeConsult));
  consultOverlay?.addEventListener('click', closeConsult);
  document.querySelectorAll('[data-special-package-form]').forEach((form) => form.addEventListener('submit', (event) => { event.preventDefault(); form.reset(); closeConsult(); showToast('Thanks — Elice will help you find your special package.'); }));
  window.addEventListener('catalog:filter', (event) => { setFilter(event.detail); const collectionSearchInput = document.querySelector('[data-collection-search]'); if (collectionSearchInput) collectionSearchInput.value = event.detail.query || ''; });
}

async function boot() {
  showToast = initNotifications();
  try {
    allProducts = await loadProducts();
    renderPage();
    initNavigation();
    initCart(allProducts, showToast);
    initCollectionSlideshow();
    initMarquee();
    initHomeTypewriter();
    renderGrid();
    renderRelatedProducts();
    bindPageEvents();
  } catch (error) {
    app.innerHTML = `<div class="page-frame"><main class="site-main"><div class="container empty-state" style="margin-top:60px"><h1>We’re giving the shelf a little reset.</h1><p>Refresh in a moment and the good stuff should be back.</p></div></main></div>`;
  }
}

boot();
