// Tiny template engine shared by the browser (components/template.js) and the build (vite.config.js).
// No imports on purpose, so it runs anywhere.
//   {{name}}           value, HTML-escaped            (dots reach into objects: {{hero.title}})
//   {{{name}}}         raw HTML (for content that contains markup, or markup built elsewhere)
//   {{#name}}..{{/name}}   repeat for each item of an array, or render once when the value is set
//   {{^name}}..{{/name}}   render only when the value is empty / false
//   {{.}}              the current item when looping over a list of plain values
// A leading <!-- @data ... --> comment documents the fields a template expects and is removed.
// Values are inserted in a single pass, so data can never inject template tags.
const TAG = /\{\{([#^])([\w.]+)\}\}([\s\S]*?)\{\{\/\2\}\}|\{\{\{([\w.]+)\}\}\}|\{\{([\w.]+)\}\}/g;
const DOC = /^\s*<!--\s*@data[\s\S]*?-->\s*/;

export const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const lookup = (stack, key) => {
  if (key === '.') {
    const top = stack[stack.length - 1];
    return top !== null && typeof top === 'object' && '.' in top ? top['.'] : top;
  }
  const [head, ...rest] = key.split('.');
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const ctx = stack[i];
    if (ctx !== null && typeof ctx === 'object' && head in ctx) {
      let value = ctx[head];
      for (const part of rest) value = value === null || value === undefined ? undefined : value[part];
      return value;
    }
  }
  return undefined;
};
const truthy = (value) => (Array.isArray(value) ? value.length > 0 : Boolean(value));

// stack: list of data objects, innermost last. onMissing(key) is called for {{key}} that resolves to nothing.
export function render(template, stack, { onMissing } = {}) {
  const run = (tpl, st) => tpl.replace(TAG, (_, kind, key, inner, rawKey, escKey) => {
    if (kind) {
      const value = lookup(st, key);
      if (kind === '^') return truthy(value) ? '' : run(inner, st);
      if (!truthy(value)) return '';
      if (Array.isArray(value)) {
        return value.map((item) => run(inner, [...st, item !== null && typeof item === 'object' ? item : { '.': item }])).join('');
      }
      return run(inner, typeof value === 'object' ? [...st, value] : st);
    }
    const name = rawKey || escKey;
    const value = lookup(st, name);
    if (value === undefined && onMissing) onMissing(name);
    return rawKey ? String(value ?? '') : escapeHtml(value);
  });
  return run(template.replace(DOC, ''), stack);
}
