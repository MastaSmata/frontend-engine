import { readdir, access, readFile } from 'node:fs/promises';
import { resolve, relative, sep, isAbsolute, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, assertValid } from './validate-schema.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const samplesRoot = resolve(root, 'samples');
const componentsRoot = resolve(root, 'src/partials');
const requested = process.argv.slice(2);
const failures = [];
const exists = (path) => access(path).then(() => true).catch(() => false);
const tenantEntries = (await readdir(samplesRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory());
const tenantNames = requested.length ? requested : (await Promise.all(tenantEntries.map(async (entry) => (
  await exists(resolve(samplesRoot, entry.name, 'site.json')) ? entry.name : null
)))).filter(Boolean).sort();

async function walk(folder) {
  const result = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = resolve(folder, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else result.push(path);
  }
  return result;
}

const componentManifests = new Map();
for (const path of (await walk(componentsRoot)).filter((item) => item.endsWith('component.json'))) {
  const manifest = JSON.parse(await readFile(path, 'utf8'));
  componentManifests.set(manifest.id, { manifest, path, folder: dirname(path) });
}

function routeEntry(route) {
  if (route === '/') return 'index.html';
  if (route.endsWith('.html')) return route.replace(/^\/+/, '');
  return `${route.replace(/^\/+|\/+$/g, '')}/index.html`;
}

function resolveBindings(value, config, label) {
  if (typeof value === 'string' && value.startsWith('$')) {
    const resolved = value.slice(1).split('.').reduce((item, key) => item?.[key], config);
    if (resolved === undefined) throw new Error(label + ' references missing site value ' + value);
    return resolved;
  }
  if (Array.isArray(value)) return value.map((item, index) => resolveBindings(item, config, label + '[' + index + ']'));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveBindings(item, config, label + '.' + key)]));
  return value;
}

for (const tenant of tenantNames) {
  try {
    const tenantDir = join(samplesRoot, tenant);
    const configPath = join(tenantDir, 'site.json');
    if (!(await exists(configPath))) throw new Error('site.json is required');
    const config = await readJson(configPath);
    if (config.id !== tenant) throw new Error('site.json id must match tenant folder (' + tenant + ')');
    const siteSchema = await readJson(resolve(root, 'src/engine/schemas/site.schema.json'));
    assertValid(config, siteSchema, tenant + '/site.json');

    const datasets = {};
    const publicDir = resolve(tenantDir, 'public');
    for (const [name, dataPath] of Object.entries(config.data || {})) {
      if (typeof dataPath !== 'string' || dataPath.includes('..') || dataPath.includes('\\') || dataPath.includes('?') || dataPath.includes('#') || dataPath.includes(':') || /[\u0000-\u001f]/.test(dataPath) || dataPath.startsWith('//') || /^[a-zA-Z]:/.test(dataPath)) {
        throw new Error('data.' + name + ' must be a safe path inside the tenant public directory');
      }
      const dataFile = resolve(publicDir, dataPath.replace(/^\/+/, ''));
      const relativeDataPath = relative(publicDir, dataFile);
      if (isAbsolute(relativeDataPath) || relativeDataPath === '..' || relativeDataPath.startsWith(`..${sep}`)) {
        throw new Error('data.' + name + ' must stay inside the tenant public directory');
      }
      datasets[name] = await readJson(dataFile);
    }
    const products = datasets.products || [];
    if (Object.hasOwn(datasets, 'products') && !Array.isArray(datasets.products)) throw new Error('data.products must point to a JSON array');
    if (products.length) {
      const productSchema = await readJson(resolve(root, 'src/engine/schemas/product.schema.json'));
      const ids = new Set();
      products.forEach((product, index) => {
        assertValid(product, productSchema, tenant + '/products[' + index + ']');
        if (ids.has(product.id)) throw new Error('duplicate product id: ' + product.id);
        ids.add(product.id);
      });
    }
    const bindingContext = { ...config, datasets, products };

    const productComponents = new Set();
    const routeOutputs = new Set();
    for (const [route, page] of Object.entries(config.routes || {})) {
      if (!route.startsWith('/')) throw new Error('route keys must start with /: ' + route);
      if (route.includes('\\') || route.includes('//') || route.includes('?') || route.includes('#') || /[\u0000-\u001f<>:"|*]/.test(route) || route.split('/').some((part) => part === '.' || part === '..')) {
        throw new Error('route contains an invalid path segment: ' + route);
      }
      const outputPath = routeEntry(route).replaceAll('\\', '/');
      if (routeOutputs.has(outputPath)) throw new Error('multiple routes map to the same output file: ' + outputPath);
      routeOutputs.add(outputPath);
      if (!page || !Array.isArray(page.components)) throw new Error(route + ' must declare a components array');
      for (const [index, instance] of page.components.entries()) {
        const id = instance.id || instance.component;
        const entry = componentManifests.get(id);
        if (!entry) throw new Error(route + ' references unknown component ' + id);
        for (const dataKey of entry.manifest.requiresData || []) {
          if (!Object.hasOwn(datasets, dataKey)) throw new Error(route + ' component ' + id + ' requires data.' + dataKey);
        }
        const props = resolveBindings(instance.props || {}, bindingContext, route + '.components[' + index + '].props');
        if (entry.manifest.schema) {
          const schema = await readJson(resolve(entry.folder, entry.manifest.schema));
          assertValid(props, schema, tenant + route + ' component ' + id + ' props');
        }
        if (entry.manifest.dynamicDependency) {
          const childId = props[entry.manifest.dynamicDependency];
          const child = componentManifests.get(childId);
          if (!child) throw new Error(id + ' references unknown nested component ' + childId);
          if (child.manifest.type !== 'product-card') throw new Error(id + ' requires a product-card component, received ' + child.manifest.type);
          productComponents.add(childId);
        }
      }
    }
    if (!Object.keys(config.routes || {}).length) throw new Error('site.json must declare at least one route');
    for (const componentId of productComponents) {
      const entry = componentManifests.get(componentId);
      const schema = await readJson(resolve(entry.folder, entry.manifest.schema));
      products.forEach((product, index) => assertValid(product, schema, tenant + '/products[' + index + '] for ' + componentId));
    }
    console.log('✓ tenant ' + tenant + ': ' + products.length + ' products; ' + Object.keys(config.routes).length + ' routes');
  } catch (error) {
    failures.push('✗ tenant ' + tenant + ': ' + error.message);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Validated ' + tenantNames.length + ' tenant site configuration(s).');
}
