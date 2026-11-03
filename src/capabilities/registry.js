export const capabilityRegistry = {
  'catalog.default': { category: 'capability', module: './catalog/catalog.js', operations: ['load', 'filter', 'search', 'random-by-category', 'related'] },
  'cart.local-storage': { category: 'capability', module: './cart/cart-store.js', operations: ['add', 'remove', 'count', 'total', 'subscribe'] },
  'search.products': { category: 'capability', module: './search/search.js', operations: ['setQuery', 'run'] },
  'checkout.debit-card': { category: 'provider', module: './checkout/checkout.js', status: 'placeholder' },
  'checkout.whatsapp': { category: 'provider', module: './checkout/checkout.js', status: 'available-when-configured' },
};
