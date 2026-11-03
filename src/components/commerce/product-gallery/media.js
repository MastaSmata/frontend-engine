export function productMedia(product = {}) {
  const images = Array.isArray(product.thumbnails) && product.thumbnails.length ? product.thumbnails : Array.isArray(product.images) && product.images.length ? product.images : [product.image];
  return images.filter(Boolean).map((src, index) => ({ src, index, active: index === 0, alt: `${product.title || product.name || 'Product'} image ${index + 1}` }));
}

export function createThumbnailState(images = []) {
  let activeIndex = 0;
  return {
    get active() { return images[activeIndex]; },
    select(index) { activeIndex = Math.max(0, Math.min(Number(index) || 0, images.length - 1)); return images[activeIndex]; },
    index() { return activeIndex; },
  };
}
