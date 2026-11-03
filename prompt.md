# AI Agent Instructions: Extend the GroundAQ Frontend Engine

## Mission

Add a new customer website or reusable website component to this repository without breaking the engine or existing sites. The engine has one shared runtime. Each site is configuration and data; each visual/functional section is an independently registered component. Do not create an independent template-family runtime.

The request may describe a perfume shop, restaurant/food vendor, skin-care store, or another business. First decide whether the current component catalog can build the requested pages. A new business category is normally a new site configuration. Add a new component only for a section design or behavior that the catalog does not provide.

Read `README.md`, `package.json`, the site and component schemas, the relevant existing `site.json` files, component manifests/templates/styles/scripts, and the validation/build code before making changes. Use the active files and machine-readable catalog as the source of truth.

## Architecture contract

```text
samples/<site-id>/
  site.json                  Site identity, theme, data paths, routes, section composition
  public/data/*.json         Optional site-owned data
  public/images/             Site-owned images and other public assets

src/partials/<role>/<name>/  Reusable section/component package
  component.json             ID, type, and local asset names
  schema.json                Allowed props
  *.html                     Component template
  *.css                      Component-scoped CSS
  component.js               Optional custom render/mount code
```

The `component.json` manifest uses `script` as the optional JavaScript file key. A folder such as `src/partials/hero/perfume-campaign/` registers as `hero.perfume-campaign`. The registry discovers manifests automatically. Route `components` arrays choose component IDs and their props in display order. The generic page shell and shared runtime generate the website routes.

## Decide the minimum change

1. Read the user request and identify pages, content, required interactions, and visual references/assets.
2. Inspect `npm run catalog:components` output, component prop schemas, and existing site compositions.
3. If existing components can implement the request, add only `samples/<site-id>/site.json` and its own public data/assets.
4. If a section is missing, add a self-contained component package in a new descriptive folder, then compose it into the new site. Keep new site content and theme values out of shared components.
5. Change shared engine/runtime/build code only when the requested behavior cannot be expressed by configuration or a component. Explain the generic need and review every existing site affected by it.

When the user supplies HTML/CSS/JS for a section, adapt that implementation into the component package contract. Split a whole page into independently selectable sections where practical. Do not copy a full page or customer's whole site into one monolithic component, add separate site HTML entry points, or add a site-specific runtime. Keep any supplied brand copy, links, and asset paths in the site's JSON/data wherever they can be props.

## Add a site

1. Choose a lowercase, filesystem-safe `<site-id>` and create `samples/<site-id>/site.json`. The directory and JSON `id` must match.
2. Follow `src/engine/schemas/site.schema.json`: include `id`, `site` (including `brand` and `title`), `theme.tokens`, and at least one route.
3. Give each route an ordered `components` array. Use IDs already in the component catalog and props allowed by each component's `schema.json`.
4. Put site-specific product records and other JSON datasets under `samples/<site-id>/public/data/`; images/media belong under `samples/<site-id>/public/`. Configure `data` paths relative to that `public/` directory. Do not use `..`, absolute paths, or paths that escape the site folder.
5. Put copy and configurable values in JSON. Use `$site.brand`, `$images.heroImage`, or another existing JSON path to bind component props to site values. Product data is optional unless a selected component declares `requiresData`.
6. Define the site color/type values through `theme.tokens` and consume them as CSS custom properties. Do not add a customer-specific theme to global CSS.
7. Add real route compositions for the requested pages. Route keys start with `/`; `/` generates `index.html`, `/collection.html` generates `collection.html`, and nested route paths generate their own `index.html`.
8. Build the target site with `npm run build -- --mode <site-id>`. The result is `dist/<site-id>/` locally. Hosting the output at a custom domain is a deployment task outside this component engine.

Example site composition:

```json
{
  "id": "purpleperf",
  "site": {
    "brand": "Purple Perfume",
    "title": "Purple Perfume",
    "currency": "NGN",
    "locale": "en-NG"
  },
  "theme": {
    "tokens": {
      "surface-rgb": "250 247 252",
      "text-rgb": "36 27 44",
      "primary-rgb": "95 49 122"
    }
  },
  "data": { "products": "data/products.json" },
  "routes": {
    "/": {
      "title": "Purple Perfume",
      "description": "Discover your signature scent.",
      "components": [
        { "id": "navigation.editorial-centered", "props": { "brand": "$site.brand", "links": [{ "label": "Shop", "href": "collection.html" }, { "label": "Contact", "href": "contact.html" }] } },
        { "id": "hero.editorial-split", "props": { "title": "Find your signature scent", "description": "Fragrance for every moment." } },
        { "id": "product-grid.standard", "props": { "title": "Explore fragrances", "cardComponent": "product-card.editorial" } },
        { "id": "footer.editorial", "props": { "brand": "$site.brand" } }
      ]
    }
  }
}
```

Treat this as a shape example only: check every component schema and provide the required properties before using the example. Restaurant/food and skin-care sites follow the same pattern; use appropriate records/assets and add a component variant when the current visual or interaction contract does not fit.

The example declares `data.products` and uses a product grid, so create `samples/purpleperf/public/data/products.json` as well. Each product must include `id`, `price`, and `image`; additional category-specific fields are allowed:

```json
[
  {
    "id": "signature-eau-de-parfum",
    "title": "Signature Eau de Parfum",
    "category": "Eau de Parfum",
    "price": 42000,
    "image": "/images/signature-eau-de-parfum.webp",
    "notes": ["bergamot", "jasmine", "amber"]
  }
]
```

## Add a reusable component

1. Choose a descriptive role and variant path, such as `src/partials/headers/mobile-first/` or `src/partials/hero/perfume-campaign/`. Check that the ID is not already registered.
2. Add the required manifest, object prop schema, HTML template, and CSS file. Add `component.js` only for behavior or rendering that templates cannot handle cleanly.
3. In `component.json`, set `id` to the folder path joined with dots, and define `name`, `type`, `template`, `style`, and `schema`. For JavaScript, set `"script": "component.js"`.
4. Keep all referenced files inside the component folder. Use relative filenames in the manifest.
5. Make the HTML a reusable section with semantic markup and accessible controls. Use normal escaped placeholders for text. Only generate raw HTML from trusted code and trusted data.
6. Scope every selector in the component stylesheet under its exact component wrapper, for example `[data-component-id="hero.perfume-campaign"] .hero`. Do not add global selectors, reset rules, or styles for other component IDs.
7. Declare all supported props in `schema.json`. Prefer `additionalProperties: false`; mark required props and constrain values where practical. Declare `requiresData` for required tenant datasets. Use `dependencies` for fixed component dependencies and `dynamicDependency` only for a prop selecting a registered nested component, following an existing validated pattern.
8. Keep site-specific wording, image paths, color values, and other tenant choices in `site.json`, site data, or props, not inside shared code.
9. Add the component ID to the relevant route composition(s) in `site.json` and pass valid props.
10. Run the component validator, tenant validator, full validation, and a build for the target site.

Example manifest:

```json
{
  "id": "hero.perfume-campaign",
  "name": "Perfume campaign hero",
  "type": "hero",
  "template": "hero.html",
  "style": "hero.css",
  "schema": "schema.json"
}
```

An optional controller may export:

```js
export function render({ template, props, context, helpers }) {
  return helpers.renderTemplate(template, [context, props]);
}

export function mount(root, props, context) {
  // Attach behavior to this component instance.
}
```

Avoid global state and global event handlers in component controllers. The shared runtime already handles common cart, search, and form interactions; inspect it before adding overlapping behavior.

## Protect existing sites and engine behavior

- Keep changes additive and scoped to the new site or new component.
- Do not overwrite or repurpose another site's folder, route, product data, assets, component ID, or brand configuration.
- Do not change existing component output to customize one site. Add a new variant when a change would alter existing sites.
- Do not introduce `src/<page>.html` tenant pages, per-business template families, tenant-specific branches in shared runtime code, or a manually maintained component registry.
- Do not add global or cross-component CSS. Component styles must be rooted at that component's `[data-component-id="..."]` wrapper.
- Do not move/delete files or refactor unrelated architecture as part of a site/component addition.
- Avoid modifying `src/engine/`, `src/app/main.js`, `src/styles/base.css`, `vite.config.js`, and scripts unless a generic capability is required. If changed, state why and inspect effects on every current sample.
- Do not add dependencies or modify lockfiles unless required for the requested feature.
- Never claim a build, preview, or validation passed unless you ran it and checked its result.

## Required validation and final review

Run these commands after implementation:

```sh
npm run catalog:components
npm run validate:components
npm run validate:tenant
npm run validate
npm run build -- --mode <site-id>
```

Use the catalog output and validators as part of the component/site contract. Fix errors caused by your change. Inspect the final diff to confirm no unrelated site or component files changed. If the project was already failing before your work, identify the baseline failure and distinguish it from new failures; do not conceal it.

In your final response, summarize the new site/component IDs, important files, the validation/build commands actually run and their results, and any implementation limitations. Do not report deployment or domain setup as complete unless that work was explicitly requested and performed.
