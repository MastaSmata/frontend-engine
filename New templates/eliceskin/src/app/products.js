let productsCache;

export async function loadProducts() {
  if (productsCache) return productsCache;
  const response = await fetch('/data/products.json');
  if (!response.ok) throw new Error('Catalog unavailable');
  productsCache = await response.json();
  return productsCache;
}

export function getProduct(products, id) {
  return products.find((product) => product.id === id) || products[0];
}

export function filterProducts(products, { query = '', category = 'all' } = {}) {
  const normalized = query.trim().toLowerCase();
  return products.filter((product) => {
    const matchesCategory = category === 'all' || product.category === category;
    const searchable = `${product.name} ${product.category} ${product.short} ${product.ingredients}`.toLowerCase();
    return matchesCategory && (!normalized || searchable.includes(normalized));
  });
}
