import { readdir, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const componentRoot = resolve(root, 'src/partials');
const failures = [];

async function walk(folder) {
  const files = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = resolve(folder, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const manifests = (await walk(componentRoot)).filter((path) => path.endsWith('component.json'));
for (const path of manifests) {
  const manifest = JSON.parse(await readFile(path, 'utf8'));
  if (!manifest.style) continue;
  const cssPath = resolve(dirname(path), manifest.style);
  const css = (await readFile(cssPath, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = css.match(/(?:^|})\s*([^@{}][^{}]*)\{/g) || [];
  const marker = '[data-component-id="' + manifest.id + '"]';
  for (const block of blocks) {
    const selectors = block.replace(/^(?:}|\s)+/, '').replace(/\{$/, '').split(',').map((selector) => selector.trim());
    for (const selector of selectors) {
      if (!selector.includes(marker)) failures.push(manifest.id + ' has CSS outside its component scope: ' + selector.slice(0, 90));
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('✓ component CSS is scoped to component roots across ' + manifests.length + ' registered components.');
}
