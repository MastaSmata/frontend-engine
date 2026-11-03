import { searchProducts } from '../catalog/catalog.js';

export function createProductSearch({ fields = ['name', 'title', 'category', 'description', 'color'] } = {}) {
  let query = '';
  return {
    setQuery(value) { query = String(value || ''); },
    getQuery() { return query; },
    run(products) { return searchProducts(products, query, fields); },
  };
}
