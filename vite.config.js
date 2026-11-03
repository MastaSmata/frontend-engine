import { defineConfig } from 'vite';
import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimizeImages } from './plugins/optimize-images.js';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const samplesRoot = resolve(projectRoot, 'samples');
const generatedBase = resolve(projectRoot, '.generated');
const sharedSrc = resolve(projectRoot, 'src');
const pageShellPath = resolve(sharedSrc, 'page-shell.html');
const DEFAULT_TENANT = 'female-fashion-studio';

const routeEntry = (route) => {
  if (route === '/') return 'index.html';
  if (route.endsWith('.html')) return route.replace(/^\/+/, '');
  return `${route.replace(/^\/+|\/+$/g, '')}/index.html`;
};

const assertSafeRoute = (route, tenant) => {
  if (!route.startsWith('/') || route.includes('\\') || route.includes('//') || route.includes('?') || route.includes('#') || /[\u0000-\u001f<>:"|*]/.test(route) || route.split('/').some((part) => part === '.' || part === '..')) {
    throw new Error(`Invalid route path "${route}" in tenant ${tenant}`);
  }
};

const titleFor = (route, config, site) => config.title || site.site?.title || site.site?.brand || route;
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character]);

async function createRouteEntries(tenant, site) {
  const generatedRoot = resolve(generatedBase, tenant);
  await mkdir(generatedRoot, { recursive: true });
  const shell = await readFile(pageShellPath, 'utf8');
  const input = {};
  const engineImport = relative(generatedRoot, resolve(sharedSrc, 'app/main.js')).split(sep).join('/');
  await writeFile(resolve(generatedRoot, 'entry.js'), `import '${engineImport.startsWith('.') ? engineImport : `./${engineImport}`}';\n`);
  const outputPaths = new Set();

  for (const [route, config] of Object.entries(site.routes || {})) {
    assertSafeRoute(route, tenant);
    const outputPath = routeEntry(route);
    if (outputPaths.has(outputPath)) throw new Error(`Multiple routes in tenant ${tenant} map to ${outputPath}`);
    outputPaths.add(outputPath);
    const sourcePath = resolve(generatedRoot, outputPath);
    const relativeSourcePath = relative(generatedRoot, sourcePath);
    if (relativeSourcePath === '..' || relativeSourcePath.startsWith(`..${sep}`)) throw new Error(`Route ${route} escapes the generated tenant directory`);
    await mkdir(dirname(sourcePath), { recursive: true });
    const entryName = outputPath.replace(/\.html$/, '').replace(/\\/g, '/');
    const description = config.description || site.site?.description || '';
    const html = shell
      .replaceAll('{{route}}', escapeHtml(route))
      .replaceAll('{{title}}', escapeHtml(titleFor(route, config, site)))
      .replaceAll('{{description}}', escapeHtml(description))
      .replaceAll('{{main}}', '/entry.js');
    await writeFile(sourcePath, html);
    input[entryName] = sourcePath;
  }

  if (!Object.keys(input).length) throw new Error(`Tenant ${tenant} has no routes in site.json`);
  return { generatedRoot, input };
}

const tenantEntries = (await readdir(samplesRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory());
const tenants = [];
for (const entry of tenantEntries) {
  try {
    await access(resolve(samplesRoot, entry.name, 'site.json'));
    tenants.push(entry.name);
  } catch {}
}

export default defineConfig(async ({ mode }) => {
  const requestedTenant = process.env.CLIENT || mode;
  const tenant = tenants.includes(requestedTenant) ? requestedTenant : DEFAULT_TENANT;
  if (process.env.CLIENT && !tenants.includes(process.env.CLIENT)) throw new Error(`CLIENT="${process.env.CLIENT}" was not found under samples/`);

  const tenantDir = resolve(samplesRoot, tenant);
  const site = JSON.parse(await readFile(resolve(tenantDir, 'site.json'), 'utf8'));
  const { generatedRoot, input } = await createRouteEntries(tenant, site);
  const onHost = Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.CF_PAGES || process.env.FLAT_OUTPUT);
  const preview = process.env.PREVIEW_TENANT;
  const outDir = preview
    ? resolve(projectRoot, 'dist', 'previews', tenant)
    : onHost
      ? resolve(projectRoot, 'dist')
      : resolve(projectRoot, 'dist', tenant);

  console.log(`[tenant] ${tenant} | [components] ${Object.values(site.routes).reduce((count, route) => count + route.components.length, 0)} route placements`);
  return {
    root: generatedRoot,
    publicDir: resolve(tenantDir, 'public'),
    resolve: {
      alias: {
        '@brand': tenantDir,
        '@engine': sharedSrc,
      },
    },
    server: { fs: { allow: [projectRoot] } },
    plugins: [optimizeImages()],
    build: {
      outDir,
      emptyOutDir: true,
      rollupOptions: { input },
    },
  };
});
