import { formatMoney } from '../../../components/commerce/money.js';

export function render({ template, props, context, helpers }) {
  const normalized = {
    ...props,
    title: props.title || props.name || 'Product',
    image: props.card || props.image || '',
    category: [props.category, props.length].filter(Boolean).join(' · '),
    productHref: props.productHref || props.href || `${context.site?.productPath || 'product.html'}?id=${encodeURIComponent(props.id)}`,
    priceLabel: formatMoney(props.price || 0, context.site || context),
    addLabel: context.labels?.addToBag || 'Add to bag',
  };
  return helpers.renderTemplate(template, [context, normalized]);
}
