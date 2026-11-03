import { formatMoney } from '../../../components/commerce/money.js';

const normalize = (product, context) => {
  const site = context.site || context;
  return {
    ...product,
    title: product.title || product.name || 'Product',
    category: product.category || '',
    image: product.card || product.image || '',
    productHref: product.productHref || product.href || `${site.productPath || 'product.html'}?id=${encodeURIComponent(product.id)}`,
    priceLabel: formatMoney(product.price || 0, site),
  };
};

export function render({ template, props, context, helpers }) {
  return helpers.renderTemplate(template, [context, normalize(props, context)]);
}
