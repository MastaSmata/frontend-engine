import { productCard } from './product-card.js';

export function productGrid(products, emptyMessage = 'No products found. Try a softer search.') {
  if (!products.length) {
    return `<div class="empty-state search-empty"><p>${emptyMessage}</p><a class="button button--outline" href="/src/pages/collection.html">See all products</a></div>`;
  }
  return products.map(productCard).join('');
}
