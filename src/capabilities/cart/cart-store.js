const safeRead = (key) => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };
const safeWrite = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage may be unavailable */ } };

export function createCartStore({ storageKey = 'cart', normalize = (product, options, quantity) => ({ ...product, qty: quantity, ...options }), identity = (item) => `${item.id}:${item.size || ''}:${item.color || ''}` } = {}) {
  let items = safeRead(storageKey);
  const listeners = new Set();
  const notify = () => { safeWrite(storageKey, items); listeners.forEach((listener) => listener(api)); };
  const api = {
    getItems: () => [...items],
    count: () => items.reduce((sum, item) => sum + Number(item.qty ?? item.quantity ?? 0), 0),
    total: () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty ?? item.quantity ?? 0), 0),
    add(product, quantity = 1, options = {}) {
      const qty = Math.max(1, Number(quantity) || 1);
      const candidate = normalize(product, options, qty);
      const existing = items.find((item) => identity(item) === identity(candidate));
      if (existing) existing.qty = Number(existing.qty || 0) + qty;
      else items.push(candidate);
      notify();
      return candidate;
    },
    remove(id) { items = items.filter((item) => item.id !== id); notify(); },
    removeAt(index) { items.splice(index, 1); notify(); },
    clear() { items = []; notify(); },
    subscribe(listener) { listeners.add(listener); listener(api); return () => listeners.delete(listener); },
  };
  return api;
}
