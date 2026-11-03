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

for (const tenant of tenants) {
  console.log('\n[build-previews] building site composition: ' + tenant);
  const result = spawnSync('npm', ['run', 'build', '--', '--mode', tenant], {
    cwd: root,
    env: { ...process.env, PREVIEW_TENANT: tenant },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('\n[build-previews] completed ' + tenants.length + ' site preview build(s).');
