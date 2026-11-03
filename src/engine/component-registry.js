import { render as renderTemplate, escapeHtml } from '../components/template-core.js';

const manifests = import.meta.glob('../partials/**/component.json', { eager: true, import: 'default' });
const templates = import.meta.glob('../partials/**/*.html', { eager: true, query: '?raw', import: 'default' });
const styles = import.meta.glob('../partials/**/*.css', { eager: true, query: '?raw', import: 'default' });
const controllers = import.meta.glob('../partials/**/component.js', { eager: true });

const definitions = new Map();
for (const [manifestPath, manifest] of Object.entries(manifests)) {
  const folder = manifestPath.replace(/component\.json$/, '');
  const templatePath = manifest.template ? `${folder}${manifest.template}` : null;
  const stylePath = manifest.style ? `${folder}${manifest.style}` : null;
  const controllerPath = manifest.script ? `${folder}${manifest.script}` : null;
  definitions.set(manifest.id, {
    manifest,
    template: templatePath ? templates[templatePath] : '',
    style: stylePath ? styles[stylePath] : '',
    controller: controllerPath ? controllers[controllerPath] : null,
  });
}

export const componentIds = () => [...definitions.keys()].sort();
export const componentCatalog = () => [...definitions.values()].map(({ manifest }) => manifest).sort((a, b) => a.id.localeCompare(b.id));

export function getComponent(id) {
  const component = definitions.get(id);
  if (!component) throw new Error(`Unknown component: ${id}`);
  if (component.manifest.template && component.template === undefined) throw new Error(`Missing template for component ${id}`);
  if (component.manifest.style && component.style === undefined) throw new Error(`Missing stylesheet for component ${id}`);
  return component;
}

const valueAt = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);
const resolveValue = (value, context) => {
  if (typeof value === 'string' && value.startsWith('$')) return valueAt(context, value.slice(1));
  if (Array.isArray(value)) return value.map((item) => resolveValue(item, context));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveValue(item, context)]));
  return value;
};

export function resolveComponentProps(props = {}, context = {}) {
  return resolveValue(props, context);
}

export function renderComponent(id, inputProps = {}, context = {}, depth = 0) {
  if (depth > 24) throw new Error(`Component nesting limit exceeded at ${id}`);
  const component = getComponent(id);
  const props = resolveComponentProps(inputProps, context);
  const helpers = {
    renderTemplate,
    renderComponent: (childId, childProps = {}) => renderComponent(childId, childProps, context, depth + 1),
  };
  const controller = component.controller;
  const html = controller?.render
    ? controller.render({ template: component.template, props, context, helpers })
    : renderTemplate(component.template, [context, props]);
  const propJson = escapeHtml(JSON.stringify(props));
  return `<div class="component-instance" data-component-id="${escapeHtml(id)}" data-component-props="${propJson}">${html}</div>`;
}

export function renderRoute(components = [], context = {}) {
  return components.map(({ id, component, props = {} }) => renderComponent(id || component, props, context)).join('\n');
}

export function collectComponentStyles(components = [], context = {}) {
  const found = new Set();
  const expanded = new Set();
  const visit = (id, inputProps = {}) => {
    const props = resolveComponentProps(inputProps, context);
    const { manifest } = getComponent(id);
    const dynamicId = manifest.dynamicDependency ? props[manifest.dynamicDependency] : '';
    const expansionKey = `${id}:${dynamicId}`;
    if (expanded.has(expansionKey)) return;
    expanded.add(expansionKey);
    found.add(id);
    for (const dependency of manifest.dependencies || []) visit(dependency);
    if (dynamicId) visit(dynamicId);
  };
  for (const item of components) visit(item.id || item.component, item.props || {});
  return [...found].map((id) => ({ id, css: getComponent(id).style })).filter((item) => item.css);
}

export function mountComponents(root, context = {}) {
  root.querySelectorAll('[data-component-id]').forEach((element) => {
    const component = getComponent(element.dataset.componentId);
    const props = JSON.parse(element.dataset.componentProps || '{}');
    component.controller?.mount?.(element, props, context);
  });
}
