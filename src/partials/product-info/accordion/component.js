import { escapeHtml } from '../../../components/template-core.js';

const bodyText = (value) => Array.isArray(value)
  ? `<ul>${value.map((item) => `<li>${escapeHtml(typeof item === 'string' ? item : item?.text || item?.label || '')}</li>`).join('')}</ul>`
  : `<p>${escapeHtml(value || '')}</p>`;

export function render({ template, props, context, helpers }) {
  const product = context.selectedProduct || {};
  const sections = [
    [props.detailsLabel || 'Details', product.description],
    [props.specificationsLabel || 'Specifications', product.specifications],
    [props.ingredientsLabel || 'Ingredients', product.ingredients],
    [props.careLabel || 'Care instructions', product.careInstructions || product.care],
    [props.shippingLabel || 'Shipping & returns', props.shippingText],
  ].filter(([, content]) => (Array.isArray(content) ? content.length : Boolean(content)));
  const html = sections.map(([label, content], index) => `<details${index === 0 ? ' open' : ''}><summary>${escapeHtml(label)}</summary><div class="product-accordion__body">${bodyText(content)}</div></details>`).join('');
  return helpers.renderTemplate(template, [context, { sections:html }]);
}
