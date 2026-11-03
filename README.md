# GroundAQ Reusable Frontend Engine

GroundAQ builds static, multi-page customer websites from reusable page sections. A website is a JSON composition of registered components, content, data, and design tokens. There is no separate runtime or template family for each kind of business.

An AI agent can combine sections from any part of the catalog, for example a navigation bar, a perfume-focused hero, a product grid, and a shared footer. If the catalog does not contain the required design or behavior, add a new reusable component package and select it by ID in the site configuration.

## The two extension workflows

### Create a new website

Create a new site when the design can be assembled from existing components. Put the site configuration and its own assets/data in `samples/<site-id>/`. The site ID must match the directory name.

1. Inspect the component catalog and its prop schemas with `npm run catalog:components`.
2. Create `samples/<site-id>/site.json` with the required `id`, `site`, `theme`, and `routes` properties.
3. Compose each route from registered component IDs, in display order. Supply only props permitted by the selected component's schema.
4. Put this site's images and JSON data under `samples/<site-id>/public/`. Point `data` entries at files inside that public directory.
5. Validate and build the site with the commands below.

For example, a perfume store, restaurant, or skin-care store is a new site configuration. It should reuse suitable components and add only the sections the current catalog is missing. Product records can carry category-specific fields, such as scent notes or ingredients, but any new UI that displays those fields must declare and validate the props/data it needs.

### Create a reusable website section

Create a component when the design or behavior is missing from the catalog. Put it in a uniquely named folder under `src/partials/<role>/<descriptive-name>/`. A component is independently selectable; do not put an entire site's pages or template family in one component.

```text
src/partials/hero/perfume-campaign/
  component.json
  schema.json
  hero.html
  hero.css
  component.js       # optional
```

The directory path defines the stable ID: `hero.perfume-campaign`. The required manifest shape is:

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

Add `"script": "component.js"` only when the component needs custom rendering or browser behavior. Declare reusable component dependencies with `dependencies`, tenant dataset requirements with `requiresData`, or a selectable nested component prop with `dynamicDependency` when the engine's existing pattern fits. Keep these contracts explicit in the manifest and schema.

Every component must include an HTML template, CSS file, and object props schema. The component registry discovers manifests automatically; adding a normal component does not require editing a central registry or the Vite configuration. The architecture validator checks that the manifest ID matches the folder path, all referenced files stay inside that folder, and CSS selectors are scoped to the component.

## Architecture

```text
samples/<site-id>/
  site.json                    Site identity, theme, data paths, routes, component props
  public/data/*.json           Optional tenant data, such as products
  public/images/               Tenant-owned media

src/partials/<role>/<variant>/ Reusable component packages
  component.json               Stable ID and local asset names
  schema.json                  Allowed props
  *.html                       Component markup
  *.css                        Component-scoped styles
  component.js                 Optional render/mount behavior (manifest key: script)

src/engine/                    Component discovery, rendering, route composition, schemas
src/app/main.js                Shared runtime and current site capabilities
src/capabilities/              Shared catalog, cart, checkout, and related behavior
src/page-shell.html            Generic HTML shell for every generated route
scripts/                       Component/site validation, catalog export, and build helpers
```

`src/engine/component-registry.js` discovers component manifests and their local assets. Route component arrays determine what is rendered and in what order. The generic page shell creates route HTML during the Vite build. There are no active hand-authored `src/index.html`, `src/product.html`, or other tenant-specific page entry points.

The current tenant directories are directly under `samples/`. A directory there is treated as a site when it contains `site.json`. Reusable site components live under `src/partials/`, while shared runtime behavior lives under `src/capabilities/`.

The sample catalog includes `eliceskin`, a five-route skincare storefront using the shared product and cart components, and `private-chef`, a single-page private dining site composed from chef-focused navigation, hero, profile, dish gallery, service pricing, testimonial, inquiry, and footer components. Run either with `npm run dev -- --mode eliceskin` or `npm run dev -- --mode private-chef`.

## Site configuration contract

The site schema requires `id`, `site`, `theme`, and `routes`. `site.json` can also contain content objects that component props bind to. Route keys begin with `/`; `/` builds `index.html`, `/collection.html` builds `collection.html`, and nested routes build nested `index.html` files.

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
  "data": {
    "products": "data/products.json"
  },
  "routes": {
    "/": {
      "title": "Purple Perfume",
      "description": "Discover your signature scent.",
      "components": [
        {
          "id": "navigation.editorial-centered",
          "props": {
            "brand": "$site.brand",
            "links": [
              { "label": "Shop", "href": "collection.html" },
              { "label": "Contact", "href": "contact.html" }
            ],
            "showCart": true
          }
        },
        {
          "id": "hero.editorial-split",
          "props": {
            "eyebrow": "Purple Perfume",
            "title": "Find your signature scent",
            "description": "Fragrance for every moment.",
            "buttonLabel": "Shop fragrances",
            "buttonHref": "collection.html"
          }
        },
        {
          "id": "product-grid.standard",
          "props": {
            "title": "Explore fragrances",
            "cardComponent": "product-card.editorial"
          }
        }
      ]
    }
  }
}
```

Strings beginning with `$` bind to a value in the site configuration, such as `$site.brand` or `$images.heroImage`. Data files are loaded from the tenant's `public/` directory. They are exposed to components through the render context as `datasets` and `products`. A component with `"requiresData": ["products"]` may only be placed on a site that declares `data.products`.

Because the example declares `data.products` and places `product-grid.standard`, it also needs `samples/purpleperf/public/data/products.json`. A product record must include `id`, `price`, and `image`; category-specific fields are allowed:

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

Theme token names become CSS custom properties on the document root. Component CSS can use those properties for site-specific colors, typography, spacing, and other supported design choices. Keep tenant copy, asset paths, and theme values in the site configuration/data rather than hard-coding one customer's values in shared source files.

## Component implementation rules

- Keep each component in its own descriptive folder. Use a clear role and variant name, such as `src/partials/headers/mobile-first/` or `src/partials/hero/perfume-campaign/`.
- Keep all component assets inside that folder. The manifest's `template`, `style`, `schema`, and optional `script` values are relative filenames.
- Use an object schema with `additionalProperties: false` unless there is a documented reason to accept extra props. Add every supported prop to the schema.
- Scope every CSS selector under the exact wrapper, for example `[data-component-id="hero.perfume-campaign"]`. Do not add global selectors such as `body`, `:root`, `*`, or unscoped element rules to a component stylesheet.
- Use theme custom properties for shared visual values. Keep component-specific selectors and behavior inside the component package.
- Use escaped `{{name}}` placeholders for ordinary text. Use triple braces only for trusted HTML generated by component code; do not pass untrusted tenant text as raw HTML.
- Keep JavaScript to component rendering and mounting. A controller can export `render({ template, props, context, helpers })` and/or `mount(root, props, context)`. Scope DOM changes and event handlers to the component instance where possible.
- Preserve semantic HTML, keyboard access, visible focus, form labels, and useful image alt text.
- If an existing component is visually close but changing it would alter other sites, add a new variant instead. Do not customize one tenant by changing shared defaults.
- Put behavior that is genuinely shared by multiple components in `src/capabilities/`; do not add site-specific business rules to the global runtime.

## Safe change boundaries

When adding a site or component, keep the change additive and limited to its configuration/assets or its new component folder. Avoid changing `src/engine/`, `src/app/main.js`, `src/styles/base.css`, Vite config, build scripts, or existing components unless the feature truly requires a generic engine change. If a generic change is necessary, explain why and check its effect on every existing sample site.

Do not move, delete, or rewrite unrelated tenant folders, existing routes, product data, or component packages. Keep tenant-specific implementation in site composition and put reusable behavior in the active engine. Do not add dependencies or alter lockfiles unless the implementation needs a dependency that the project does not already have. Domain/DNS/TLS setup is outside this repository's site composition.

## Commands and review

```sh
npm run catalog:components
npm run validate:components
npm run validate:tenant
npm run validate
npm run dev -- --mode <site-id>
npm run build -- --mode <site-id>
```

Use `npm run catalog:components` to export manifest metadata and prop schemas for an AI composer. Run `npm run validate` after changes; it checks component contracts and all discovered tenant configurations. Build the target site with its Vite mode. `npm run build:all` builds every site, while `npm run build:previews` creates isolated previews and runs the isolation validator.

Before finishing a change, inspect the diff. Confirm that only intended files changed, existing tenant configurations and component behavior remain intact, and the new site/component is included in validation/build output. Report the exact site ID, component IDs, files added/changed, and commands run.

## Current component coverage

The starter catalog includes navigation, hero and video, editorial content, product card/grid/detail, galleries, product information, service pricing, testimonials, contact forms, social links, feedback, footer, cart, search, and button components. Check the current machine-readable catalog rather than assuming a component exists. An unfamiliar business category can be created as a site today by composing applicable pieces; implement a new reusable section when the catalog does not have an appropriate design or behavior.
