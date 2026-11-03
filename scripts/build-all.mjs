import { access, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const samplesRoot = resolve(root, 'samples');
const tenantEntries = (await readdir(samplesRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory());
const tenants = [];
for (const entry of tenantEntries) {
  try {
    await access(resolve(samplesRoot, entry.name, 'site.json'));
    tenants.push(entry.name);
  } catch {}
}
tenants.sort();

if (!tenants.length) throw new Error(`No tenant site.json files found under ${samplesRoot}`);
for (const tenant of tenants) {
  console.log(`\n[build-all] building tenant: ${tenant}`);
  const result = spawnSync('npm', ['run', 'build', '--', '--mode', tenant], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(`\n[build-all] completed ${tenants.length} tenant build(s).`);
