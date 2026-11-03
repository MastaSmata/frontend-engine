import { productMedia } from '../../../components/commerce/product-gallery/media.js';

export function render({ template, props, context, helpers }) {
  const product = context.selectedProduct || {};
  const images = productMedia(product);
  const image = images[0]?.src || product.image || '';
  return helpers.renderTemplate(template, [context, {
    ...props,
    images: images.map((item, index) => ({ ...item, active:index === 0, label:`View image ${index + 1}` })),
    image,
    mainAlt: props.mainAlt || product.title || product.name || 'Product image',
  }]);
}

export function mount(root) {
  const main = root.querySelector('[data-gallery-main]');
  root.querySelectorAll('[data-gallery-thumb]').forEach((button) => button.addEventListener('click', () => {
    if (!main) return;
    main.style.opacity = '0';
    setTimeout(() => { main.src = button.dataset.galleryThumb; main.style.opacity = '1'; }, 100);
    root.querySelectorAll('[data-gallery-thumb]').forEach((item) => item.classList.toggle('is-active', item === button));
  }));
}
