import { readdir, readFile, access } from 'node:fs/promises';
import { resolve, relative, dirname, sep, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const componentsRoot = resolve(root, 'src/partials');
const failures = [];
const exists = (path) => access(path).then(() => true).catch(() => false);
const assetPath = (folder, asset) => {
  if (typeof asset !== 'string' || !asset.trim()) throw new Error('component asset paths must be non-empty relative paths');
  const path = resolve(folder, asset);
  const fromFolder = relative(folder, path);
  if (isAbsolute(fromFolder) || fromFolder === '..' || fromFolder.startsWith(`..${sep}`)) throw new Error('component assets must stay inside their component folder: ' + asset);
  return path;
};

async function walk(folder) {
  const result = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = resolve(folder, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else result.push(path);
  }
  return result;
}

function cssSelectors(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = [];

  function collect(start, end) {
    let cursor = start;
    while (cursor < end) {
      while (cursor < end && /\s|;/.test(source[cursor])) cursor += 1;
      if (cursor >= end) break;

      let open = cursor;
      while (open < end && source[open] !== '{' && source[open] !== '}') open += 1;
      if (open >= end || source[open] === '}') break;

      let depth = 1;
      let close = open + 1;
      while (close < end && depth > 0) {
        if (source[close] === '{') depth += 1;
        else if (source[close] === '}') depth -= 1;
        close += 1;
      }

      const prelude = source.slice(cursor, open).trim();
      if (/^@(media|supports|container|layer|document)\b/i.test(prelude)) collect(open + 1, close - 1);
      else if (prelude && !prelude.startsWith('@')) selectors.push(...prelude.split(',').map((selector) => selector.trim()));
      cursor = close;
    }
  }

  collect(0, source.length);
  return selectors;
}

const manifestFiles = (await walk(componentsRoot)).filter((path) => path.endsWith('component.json'));
const ids = new Set();
for (const manifestPath of manifestFiles) {
  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const folder = dirname(manifestPath);
    const folderId = relative(componentsRoot, folder).split(sep).join('.');
    if (!manifest.id || manifest.id !== folderId) failures.push(relative(root, manifestPath) + ': id must match its descriptive folder path (' + folderId + ')');
    if (ids.has(manifest.id)) failures.push('duplicate component id: ' + manifest.id);
    ids.add(manifest.id);
    if (!manifest.name || !manifest.type) failures.push((manifest.id || manifestPath) + ': name and type are required');
    if (!manifest.template) failures.push(manifest.id + ': template is missing');
    else if (!(await exists(assetPath(folder, manifest.template)))) failures.push(manifest.id + ': template is missing');
    if (!manifest.style) failures.push(manifest.id + ': component stylesheet is missing');
    if (!manifest.schema) failures.push(manifest.id + ': props schema is missing');
    else {
      const schemaPath = assetPath(folder, manifest.schema);
      if (!(await exists(schemaPath))) failures.push(manifest.id + ': schema is missing');
      else {
        const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
        if (schema.type !== 'object') failures.push(manifest.id + ': props schema must describe an object');
      }
    }
    if (manifest.style) {
      const stylePath = assetPath(folder, manifest.style);
      if (!(await exists(stylePath))) failures.push(manifest.id + ': stylesheet is missing');
      else {
        const css = await readFile(stylePath, 'utf8');
        for (const selector of cssSelectors(css)) {
          const marker = '[data-component-id="' + manifest.id + '"]';
          if (!selector.includes(marker)) failures.push(manifest.id + ': unscoped selector "' + selector.slice(0, 90) + '"');
        }
      }
    }
    if (manifest.script && !(await exists(assetPath(folder, manifest.script)))) failures.push(manifest.id + ': script is missing');
    console.log('✓ component ' + manifest.id);
  } catch (error) {
    failures.push(relative(root, manifestPath) + ': ' + error.message);
  }
}

for (const required of ['engine/component-registry.js', 'engine/route-composition.js', 'capabilities/catalog/catalog.js', 'capabilities/cart/cart-store.js']) {
  if (!(await exists(resolve(root, 'src', required)))) failures.push('required engine module is missing: src/' + required);
}
if (!manifestFiles.length) failures.push('no component manifests found under src/partials');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Validated ' + ids.size + ' reusable component(s).');
}
