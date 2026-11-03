import { renderIcon } from '../../../components/ui/icons.js';
import { escapeHtml } from '../../../components/template-core.js';

export function render({ template, props, context, helpers }) {
  const items = (props.benefits || []).map((benefit) => {
    const icon = renderIcon(benefit.icon || 'star', 22, 'benefits__icon-svg');
    return `<article class="benefits__item"><span class="benefits__icon" aria-hidden="true">${icon}</span><div><h3>${escapeHtml(benefit.title || '')}</h3><p>${escapeHtml(benefit.text || '')}</p></div></article>`;
  }).join('');
  return helpers.renderTemplate(template, [context, { ...props, items }]);
}
