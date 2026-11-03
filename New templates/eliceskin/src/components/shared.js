export const icon = {
  search: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>',
  bag: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
  menu: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.2a3.6 3.6 0 1 1-3-3.55"/><path d="M14 4c.5 2.2 1.9 3.6 4.2 3.9"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.7" r=".8" fill="currentColor" stroke="none"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true"><path d="M12 2.2a9.8 9.8 0 0 0-8.43 14.8L2.2 21.8l4.96-1.3A9.8 9.8 0 1 0 12 2.2Z"/><path fill="#fff" d="M8.7 7.1c.26-.3.59-.31.88-.08l1.02.84c.27.22.33.59.14.88l-.54.8c.64 1.08 1.54 1.95 2.65 2.55l.76-.5c.31-.2.7-.15.92.12l.82.99c.25.3.2.75-.1.98-.6.48-1.38.68-2.1.5-1.5-.36-3-1.3-4.37-2.65-1.36-1.36-2.3-2.87-2.66-4.37-.17-.72.02-1.5.48-2.07Z"/></svg>',
  mastercard: '<svg viewBox="0 0 32 20" width="25" height="16" aria-hidden="true"><rect x=".5" y=".5" width="31" height="19" rx="3" fill="#f5f1e9" stroke="#e3dbcd" stroke-width=".7"/><rect x="3" y="4" width="4" height="3" rx=".7" fill="#d2b36e"/><circle cx="13" cy="10.5" r="4.2" fill="#eb001b"/><circle cx="19" cy="10.5" r="4.2" fill="#f79e1b"/><path d="M16 7.2a4.2 4.2 0 0 0 0 6.6 4.2 4.2 0 0 0 0-6.6Z" fill="#ff5f00"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.8V3.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V10H8v3h2.6v8h2.9Z"/></svg>',
  email: '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>'
};

export function formatPrice(amount) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function reviewStars(rating) {
  return Array.from({ length: 5 }, (_, index) => {
    const progress = Math.max(0, Math.min(1, rating - index));
    const style = progress > 0 && progress < 1 ? ` style="--star-progress:${Math.round(progress * 100)}%"` : '';
    return `<span class="review-star ${progress >= 1 ? 'is-filled' : progress > 0 ? 'is-partial' : ''}"${style} aria-hidden="true">★</span>`;
  }).join('');
}

const pageLinks = [
  ['Shop all', '/src/pages/collection.html', 'collection'],
  ['Our story', '/src/pages/about.html', 'about'],
  ['Contact', '/src/pages/contact.html', 'contact'],
  ['Consult Elice', '#consult', 'consult']
];

export function productArt(product, wide = false) {
  return `
    <div class="product-art${wide ? ' product-art--wide' : ''}" style="--art-bg:${product.color}; --bottle-color:${product.color}; --bottle-accent:${product.accent};">
      <div class="product-bottle" aria-hidden="true">
        <span class="bottle-cap"></span>
        <span class="bottle-neck"></span>
        <span class="bottle-body"><span class="bottle-label">${product.emoji}<br>${product.name.split(' ')[0]}<br>elice</span></span>
      </div>
    </div>
  `;
}

export function headerTemplate(activePage = '') {
  const links = pageLinks.map(([label, href, key]) => `<a href="${href}"${activePage === key ? ' aria-current="page"' : ''}${key === 'consult' ? ' data-consult-open' : ''}>${label}</a>`).join('');
  return `
    <div class="announcement-bar">Free shipping on orders over ₦50,000 · skin first, always</div>
    <header class="site-header">
      <div class="container nav-wrap">
        <a class="brand" href="/" aria-label="Elice SKincare home"><span class="brand-spark">✦</span><span>Elice</span></a>
        <nav class="nav-links" aria-label="Primary navigation">${links}</nav>
        <label class="nav-search-mobile" aria-label="Quick search">
          <input type="search" placeholder="Search" data-global-search />
          <span>${icon.search}</span>
        </label>
        <div class="nav-tools">
          <label class="search-shell" aria-label="Search products">
            <input type="search" placeholder="Search skin joy" data-global-search />
            <span class="search-icon">${icon.search}</span>
          </label>
          <div class="category-wrap" data-category-wrap>
            <button class="category-toggle" type="button" data-category-toggle>Categories <span aria-hidden="true">⌄</span></button>
            <div class="category-menu" data-category-menu>
              <button type="button" data-category="all">All products</button>
              <button type="button" data-category="Cleanse">Cleanse</button>
              <button type="button" data-category="Treat">Treat</button>
              <button type="button" data-category="Moisturize">Moisturize</button>
              <button type="button" data-category="Protect">Protect</button>
              <button type="button" data-category="Sets">Sets</button>
            </div>
          </div>
          <button class="icon-button" type="button" data-cart-open aria-label="Open cart">${icon.bag}<span class="cart-count" data-cart-count>0</span></button>
          <button class="icon-button menu-toggle" type="button" data-menu-toggle aria-label="Open menu" aria-expanded="false">${icon.menu}</button>
        </div>
      </div>
      <div class="mobile-menu" data-mobile-menu>
        <div class="container">
          <label class="mobile-search"><input type="search" placeholder="Search skin joy" data-mobile-search />${icon.search}</label>
          <div class="mobile-category-wrap" data-mobile-category-wrap>
            <button class="mobile-category-toggle" type="button" data-mobile-category-toggle>Categories <span aria-hidden="true">⌄</span></button>
            <div class="mobile-category-menu">
              <button type="button" data-category="all">All products</button>
              <button type="button" data-category="Cleanse">Cleanse</button>
              <button type="button" data-category="Treat">Treat</button>
              <button type="button" data-category="Moisturize">Moisturize</button>
              <button type="button" data-category="Protect">Protect</button>
              <button type="button" data-category="Sets">Sets</button>
            </div>
          </div>
          <nav aria-label="Mobile navigation">${links}</nav>
        </div>
      </div>
    </header>
  `;
}

export function footerTemplate() {
  return `
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <a class="footer-mark" href="/"><span class="brand-spark">✦</span><span>Elice SKincare</span></a>
          <p>Small rituals, good ingredients, and a little more joy for the skin you live in.</p>
          <a class="text-link" href="/src/pages/collection.html">Shop the collection</a>
        </div>
        <div class="footer-nav">
          <div><h3>Explore</h3><a href="/src/pages/collection.html">All products</a><a href="/src/pages/about.html">Our story</a><a href="/src/pages/contact.html">Contact</a><a href="#consult" data-consult-open>Consult Elice</a></div>
          <div><h3>Care notes</h3><a href="/src/pages/contact.html">Shipping & returns</a><a href="/src/pages/contact.html">Ingredient glossary</a><a href="/src/pages/contact.html">FAQ</a></div>
          <div><h3>Say hi</h3><div class="social-links" aria-label="Elice social links"><a class="social-link" href="https://www.tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">${icon.tiktok}</a><a class="social-link" href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">${icon.instagram}</a><a class="social-link" href="https://wa.me/?text=Hello%20Elice" target="_blank" rel="noreferrer" aria-label="WhatsApp">${icon.whatsapp}</a><a class="social-link" href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">${icon.facebook}</a><a class="social-link" href="mailto:hello@eliceskincare.com" aria-label="Email Elice">${icon.email}</a></div><a href="/src/pages/contact.html">Join the joy list</a></div>
        </div>
      </div>
      <div class="container footer-bottom"><span>© 2026 Elice SKincare</span><span>Made for sensitive-ish humans</span></div>
    </footer>
  `;
}

export function cartTemplate() {
  return `
    <div class="cart-overlay" data-cart-overlay></div>
    <aside class="cart-drawer" data-cart-drawer aria-hidden="true">
      <div class="cart-header"><h2>Your bag</h2><button class="cart-close" type="button" data-cart-close aria-label="Close cart">${icon.close}</button></div>
      <div class="cart-items" data-cart-items></div>
      <div class="cart-summary" data-cart-summary></div>
    </aside>
  `;
}

export function consultTemplate() {
  return `
    <div class="consult-overlay" data-consult-overlay></div>
    <aside class="consult-modal" data-consult-modal aria-hidden="true" role="dialog" aria-labelledby="consult-title">
      <div class="consult-modal-header"><div><p class="eyebrow">Consult Elice</p><h2 id="consult-title">Not sure what to buy?</h2></div><button class="cart-close" type="button" data-consult-close aria-label="Close consultation form">${icon.close}</button></div>
      <p class="consult-modal-intro">Share your details and we’ll help you find a special package for your skin.</p>
      <form class="consult-form" data-special-package-form>
        <h3>Fill in your details and get your special package</h3>
        <label class="consult-field"><span>Name</span><input name="name" type="text" autocomplete="name" placeholder="Your name" required /></label>
        <label class="consult-field"><span>Phone number</span><input name="phone" type="tel" autocomplete="tel" placeholder="Your phone number" required /></label>
        <button class="button" type="submit">Get Special Package</button>
      </form>
    </aside>
  `;
}
