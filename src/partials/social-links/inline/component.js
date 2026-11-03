import { escapeHtml } from '../../../components/template-core.js';

const icons = {
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.2" cy="6.8" r="1"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6H17V3.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V10H8v3h2.6v8z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8l-1.4 4.8 5-1.3A9.8 9.8 0 1 0 12 2.2Zm0 17.6a7.8 7.8 0 0 1-4-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A7.8 7.8 0 1 1 12 19.8Z"/></svg>',
};

export function render({ template, props, context, helpers }) {
  const items = (props.links || []).map(({ label, href, icon }) => {
    const external = /^https?:/i.test(href);
    return `<a href="${escapeHtml(href)}" aria-label="${escapeHtml(label)}"${external ? ' target="_blank" rel="noreferrer"' : ''}>${icons[icon] || ''}</a>`;
  }).join('');
  return helpers.renderTemplate(template, [context, { ...props, label: props.label || 'Social media', items }]);
}
