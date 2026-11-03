const cache = new Map();

export async function loadJson(path, { label = path, expected = 'array', baseUrl = import.meta.env.BASE_URL } = {}) {
  const url = `${baseUrl}${String(path).replace(/^\//, '')}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (expected === 'array' && !Array.isArray(data)) throw new Error('expected an array');
    if (expected === 'object' && (!data || typeof data !== 'object' || Array.isArray(data))) throw new Error('expected an object');
    return data;
  } catch (error) {
    console.error(`[catalog] Could not load ${label} (${path}):`, error);
    return null;
  }
}

export function createProductRepository({ path = 'data/products.json', label = 'products', normalize = (product) => product } = {}) {
  let promise;
  return {
    load() {
      if (!promise) promise = loadJson(path, { label }).then((items) => items?.filter(Boolean).map(normalize) ?? null);
      return promise;
    },
    clear() { promise = undefined; },
  };
}

export const categories = (products = [], getCategory = (product) => product.category) => ['all', ...new Set(products.map(getCategory).filter(Boolean).map((value) => value.toLowerCase()))];
export const filterProducts = (products = [], category = 'all', getCategory = (product) => product.category) => category === 'all' ? products : products.filter((product) => getCategory(product)?.toLowerCase() === category.toLowerCase());
export const searchProducts = (products = [], query, fields = ['name', 'title', 'category', 'description', 'color']) => { const needle = String(query || '').trim().toLowerCase(); return !needle ? products : products.filter((product) => fields.some((field) => String(product[field] ?? '').toLowerCase().includes(needle))); };
export const randomByCategory = (products = [], limit = 2, getCategory = (product) => product.category) => [...new Set(products.map(getCategory))].flatMap((category) => products.filter((product) => getCategory(product) === category).sort(() => Math.random() - 0.5).slice(0, limit));
export const newest = (products = [], limit = 4) => products.slice(0, limit);
export const relatedProducts = (products = [], selected, limit = 3, getCategory = (product) => product.category) => products.filter((product) => product.id !== selected?.id && (!selected || getCategory(product) === getCategory(selected))).slice(0, limit).concat(products.filter((product) => product.id !== selected?.id && (!selected || getCategory(product) !== getCategory(selected))).slice(0, Math.max(0, limit - 1)));
