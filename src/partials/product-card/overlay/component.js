import { formatMoney } from '../../../components/commerce/money.js';

export function render({ template, props, context, helpers }) {
  const site = context.site || context;
  const title = props.title || props.name || 'Product';
  return helpers.renderTemplate(template, [context, {
    ...props,
    title,
    image: props.card || props.image || '',
    productHref: props.productHref || props.href || `${site.productPath || 'product.html'}?id=${encodeURIComponent(props.id)}`,
    priceLabel: formatMoney(props.price || 0, site),
    addLabel: context.labels?.addToBag || 'Add to bag',
  }]);
}
