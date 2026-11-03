// Build-time image optimizer (runs only in `npm run build`; the source pictures are never touched).
//
// For every JPG / PNG / AVIF under the client's images/ folder it writes, next to the original in the build output:
//   name.webp       the full picture, at most 1000 px wide (1600 px for images/general/)
//   name-600.webp   a small version (600 px wide) used by cards, the cart and the editorial strip
// Then it rewrites the built pages, JavaScript bundles, and data files to point to the WebP files, and adds a `card` field
// (the small version) to every product in data/products.json. The original files stay in the output untouched,
// so old links and saved carts keep working. If `sharp` is not installed the site is simply served unoptimized.
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join, extname, relative, sep } from 'node:path';

const RASTER = new Set(['.jpg', '.jpeg', '.png', '.avif']);
const CARD_WIDTH = 600; // small version: enough for phones and desktop cards
const FULL_WIDTH = 1000; // product pictures (the product page shows them about 530 px wide)
const GENERAL_WIDTH = 1600; // hero / about pictures
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const urlOf = (outDir, file) => '/' + relative(outDir, file).split(sep).join('/');
const kb = (n) => `${Math.round(n / 1024)} KB`;

export function optimizeImages() {
  let outDir;
  return {
    name: 'optimize-images',
    apply: 'build',
    configResolved(config) { outDir = resolve(config.root, config.build.outDir); },
    async closeBundle() {
      let sharp;
      try { sharp = (await import('sharp')).default; } catch { console.warn('[optimize-images] "sharp" is not installed, so pictures are served as they are (run npm install).'); return; }
      const imagesDir = join(outDir, 'images');
      if (!existsSync(imagesDir)) return;

      const files = walk(imagesDir).filter((f) => RASTER.has(extname(f).toLowerCase()));
      const map = new Map(); // '/images/products/a.jpg' -> { full, card }
      let before = 0, fullBytes = 0, cardBytes = 0;
      await Promise.all(files.map(async (file) => {
        const base = file.slice(0, -extname(file).length);
        const url = urlOf(outDir, file);
        const isGeneral = url.startsWith('/images/general/');
        const source = sharp(file, { failOn: 'none' }).rotate();
        const fullInfo = await source.clone().resize({ width: isGeneral ? GENERAL_WIDTH : FULL_WIDTH, withoutEnlargement: true }).webp({ quality: isGeneral ? 78 : 74, effort: 5 }).toFile(`${base}.webp`);
        before += statSync(file).size;
        fullBytes += fullInfo.size;
        const entry = { full: urlOf(outDir, `${base}.webp`) };
        if (!isGeneral) {
          const cardInfo = await source.clone().resize({ width: CARD_WIDTH, withoutEnlargement: true }).webp({ quality: 70, effort: 5 }).toFile(`${base}-${CARD_WIDTH}.webp`);
          entry.card = urlOf(outDir, `${base}-${CARD_WIDTH}.webp`);
          cardBytes += cardInfo.size;
        }
        map.set(url, entry);
      }));

      // 1) data files: add the small version of each product picture
      for (const file of walk(outDir).filter((f) => f.endsWith('.json'))) {
        let data;
        try { data = JSON.parse(readFileSync(file, 'utf8')); } catch { continue; }
        if (!Array.isArray(data)) continue;
        let touched = false;
        for (const item of data) {
          const hit = item && typeof item.image === 'string' && map.get(item.image);
          if (hit?.card) { item.card = hit.card; touched = true; }
        }
        if (touched) writeFileSync(file, JSON.stringify(data, null, 2));
      }
      // 2) pages and data files: point every picture to its WebP
      const pairs = [...map].map(([from, { full }]) => [from, full]).sort((a, b) => b[0].length - a[0].length);
      for (const file of walk(outDir).filter((f) => /\.(html|json|js)$/.test(f))) {
        let text = readFileSync(file, 'utf8'); const original = text;
        for (const [from, to] of pairs) text = text.split(from).join(to);
        if (text !== original) writeFileSync(file, text);
      }
      console.log(`[optimize-images] ${files.length} pictures. Originals ${kb(before)} | full WebP ${kb(fullBytes)} | small WebP ${kb(cardBytes)} (the small ones are what cards and the cart download)`);
    },
  };
}
