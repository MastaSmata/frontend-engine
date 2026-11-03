import { formatMoney } from '../../../components/commerce/money.js';
import { escapeHtml } from '../../../components/template-core.js';

const slug = (value) => String(value || 'option').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'option';
const valueName = (value) => typeof value === 'string' ? value : (value?.name || '');
const safeColor = (value) => {
  const color = typeof value === 'object' ? value?.hex : value;
  return /^(#[\da-f]{3,8}|[a-z]{1,20})$/i.test(String(color || '')) ? String(color) : 'transparent';
};

function productOptions(product) {
  if (Array.isArray(product.options) && product.options.length) return product.options.map((option) => ({
    name: option.name || 'Options',
    key: slug(option.name),
    swatch: option.type === 'swatch',
    values: option.values || [],
  })).filter((group) => group.values.length);
  return [
    Array.isArray(product.colors) && product.colors.length ? { name: 'Color', key: 'color', swatch: true, values: product.colors } : null,
    Array.isArray(product.sizes) && product.sizes.length ? { name: 'Size', key: 'size', swatch: false, values: product.sizes } : null,
  ].filter(Boolean);
}

export function render({ template, props, context, helpers }) {
  const product = context.selectedProduct || {};
  const optionsHtml = productOptions(product).map((group) => {
    const buttons = group.values.map((value, index) => {
      const name = valueName(value);
      const colorStyle = group.swatch ? ' style=\"--option-swatch:' + escapeHtml(safeColor(value)) + '\"' : '';
      const content = group.swatch
        ? '<span class=\"product-detail__swatch\" aria-hidden=\"true\"></span><span>' + escapeHtml(name) + '</span>'
        : escapeHtml(name);
      return '<button type=\"button\" data-option-group=\"' + escapeHtml(group.key) + '\" data-option-value=\"' + escapeHtml(name) + '\" aria-pressed=\"' + (index === 0 ? 'true' : 'false') + '\" class=\"' + (index === 0 ? 'is-selected' : '') + '\"' + colorStyle + '>' + content + '</button>';
    }).join('');
    return '<div class=\"product-detail__options\"><span>' + escapeHtml(group.name) + '</span>' + buttons + '</div>';
  }).join('');
  const gallery = helpers.renderComponent('product-gallery.thumbnails', { mainAlt: product.title || product.name || 'Product image' });
  const quantityControl = helpers.renderComponent('quantity-selector.standard');
  const information = helpers.renderComponent('product-info.accordion');
  return helpers.renderTemplate(template, [context, {
    ...props,
    ...product,
    title: product.title || product.name || 'Product unavailable',
    image: product.image || '',
    priceLabel: formatMoney(product.price || 0, context.site || context),
    optionsHtml,
    gallery,
    quantityControl,
    information,
    addLabel: props.addLabel || context.labels?.addToBag || 'Add to bag',
  }]);
}
