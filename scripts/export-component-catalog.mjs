import { readdir, readFile } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const componentsRoot = resolve(root, 'src/partials');

async function walk(folder) {
  const files = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = resolve(folder, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const manifests = (await walk(componentsRoot)).filter((path) => path.endsWith('component.json'));
const catalog = [];
for (const manifestPath of manifests) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const folder = dirname(manifestPath);
  const schema = manifest.schema ? JSON.parse(await readFile(resolve(folder, manifest.schema), 'utf8')) : null;
  catalog.push({
    ...manifest,
    folder: relative(root, folder).replaceAll('\\', '/'),
    propsSchema: schema,
  });
}
catalog.sort((a, b) => a.id.localeCompare(b.id));
process.stdout.write(JSON.stringify(catalog, null, 2) + '\n');
