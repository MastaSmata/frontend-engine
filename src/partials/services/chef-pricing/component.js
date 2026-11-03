import { escapeHtml } from '../../../components/template-core.js';
import { formatMoney } from '../../../components/commerce/money.js';

export function render({ template, props, context, helpers }) {
  const catalog = context.datasets?.services || {};
  const services = Array.isArray(catalog.services) ? catalog.services : [];
  const serviceGroups = services.map((service) => {
    const options = (service.options || []).map((option) => `<div class="chef-services__option"><strong>${escapeHtml(option.name)}</strong><span>${escapeHtml(formatMoney(option.price, context.site || {}))} ${escapeHtml(option.price_label || '')}</span></div>`).join('');
    return `<article class="chef-services__group"><h3>${escapeHtml(service.name)}</h3>${options}</article>`;
  }).join('');
  const terms = (catalog.terms_and_conditions || []).map((term) => `<li>${escapeHtml(term)}</li>`).join('');
  return helpers.renderTemplate(template, [context, { ...props, serviceGroups, terms }]);
}
