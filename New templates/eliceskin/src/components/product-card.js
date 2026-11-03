import { formatPrice, icon, reviewStars } from './shared.js';

export function productCard(product) {
  return `
    <article class="product-card" data-product-card data-product-id="${product.id}">
      <a class="product-card-link" href="/src/pages/product.html?id=${product.id}" aria-label="View ${product.name}">
        <div class="product-art-wrap">
          <div class="product-art product-art--image" style="--art-bg:${product.color};">
            <img class="product-image" src="${product.image}" alt="${product.name} product image" loading="lazy" />
          </div>
          <span class="product-card-tag">${product.tag}</span>
        </div>
        <div class="product-card-info">
          <div><h3>${product.name}</h3><p>${product.short}</p><div class="product-rating" aria-label="${product.rating.toFixed(1)} out of 5 stars">${reviewStars(product.rating)} <span>${product.rating.toFixed(1)}</span></div></div>
          <div><div class="product-price">${formatPrice(product.price)}</div><button class="product-add" type="button" data-add-to-cart="${product.id}" aria-label="Add ${product.name} to cart">${icon.bag}</button></div>
        </div>
      </a>
    </article>
  `;
}
