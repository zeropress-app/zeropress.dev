# ZeroPress Theme Runtime Spec v0.5

> Status: Active (current manifest contract for validation and build)

## 0. Core Philosophy

- Themes define markup, styling, and small client enhancements.
- Build tooling owns data preparation and file emission.
- Theme bundles are file-only artifacts.
- Themes should render meaningful HTML without depending on SPA routing or app state.

## 1. Scope

A ZeroPress theme is responsible for:

- HTML templates
- CSS and static assets
- Theme metadata (`theme.json`)
- Theme-owned progressive enhancement JS

Out of scope:

- Backend APIs, authentication, and admin workflows
- CMS authoring state
- Database schema or migration concerns
- Client-side application shell patterns

## 2. Runtime Contract

Baseline structure:

```txt
my-theme/
  theme.json
  layout.html
  index.html
  post.html
  page.html
  archive.html
  category.html
  tag.html
  404.html (optional)
  partials/
    *.html
  assets/
    style.css
    theme.js (optional)
```

Key points:

- `runtime` is required and must be `"0.5"`.
- `layout.html`, `index.html`, `post.html`, `page.html`, and `assets/style.css` are required.
- `archive.html`, `category.html`, `tag.html`, and `404.html` are optional.
- `partials/` is optional, but referenced partials must exist.
- `assets/theme.js` is optional and is theme-owned.

## 3. `theme.json` v0.5

Minimal example:

```json
{
  "name": "My Theme",
  "namespace": "your-namespace",
  "slug": "my-theme",
  "version": "0.5.0",
  "license": "MIT",
  "runtime": "0.5"
}
```

Notable metadata supported in `v0.5`:

- `features.comments`
- `features.newsletter`
- `menuSlots`
- `widgetAreas`

`runtime` does not have a fallback. Missing or non-`0.5` values fail validation.

## 4. Template Syntax

`v0.5` supports simple control-flow, partial includes with literal args, and branch reduction:

```html
{{#if path}}...{{#else}}...{{/if}}
{{#if path}}...{{#else_if other.path}}...{{#else}}...{{/if}}
{{#if_eq path "literal"}}...{{#else}}...{{/if_eq}}
{{#if_eq path "literal"}}...{{#else_if_eq other.path "other"}}...{{/if_eq}}
{{#for item in path}}...{{/for}}
{{loop.index}}
{{partial:sidebar-widgets}}
{{partial:post-list-item variant="compact" show_excerpt=true}}
{{! inline comment }}
{{!-- block comment --}}
```

Rules:

- `slot` tags are reserved for layout composition.
- `partial` tags resolve to `partials/<name>.html`.
- Partials share the current render context.
- Missing or circular partial references fail validation.
- Unsupported tags such as `if_neq`, `unless`, or custom expressions are invalid.

## 5. Rendering Semantics

- `{{path}}` is escaped by default.
- Raw HTML is only allowed through explicit `html` / `_html` fields.
- Safe URL fields may use `_url` suffixes prepared by build tooling.
- Structured theme data is preferred over render-ready HTML fragments.

Examples of structured contract patterns:

- `posts.items[]`
- `pagination.pages[]`
- `archive.groups[]`
- `post.author`
- `post.categories[]`
- `post.tags[]`
- `post.prev`
- `post.next`

## 6. Progressive Enhancement

Theme JS may enhance optional UI after initial render, for example:

- static search UI
- comments island mounting
- client-side TOC generation
- theme toggle behavior

These are enhancements, not required core document content.

## 7. JSON Schema

Machine-readable schema:

- [Theme Manifest Runtime v0.5 Schema](/schemas/theme.v0.5.runtime.schema.json)
