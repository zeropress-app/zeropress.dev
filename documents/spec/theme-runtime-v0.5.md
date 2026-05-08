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
- `features.postIndex`
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
- Variable path segments may contain letters, digits, underscores, and internal hyphens, such as `menus.docs-sidebar.items`.
- Hyphens cannot start or end a path segment, and consecutive hyphens are invalid.
- Missing or circular partial references fail validation.
- Unsupported tags such as `if_neq`, `unless`, or custom expressions are invalid.
- `if_eq` compares strictly against a string literal and does not coerce types.
- `loop.index` is a zero-based number. `{{#if_eq loop.index "4"}}` does not match; use `loop.first`, `loop.last`, CSS `:nth-child()`, or prepared data for positional layout.

## 5. Rendering Semantics

- `{{path}}` is escaped by default.
- Raw HTML is only allowed through explicit `html` / `_html` fields.
- Safe URL fields may use `_url` suffixes prepared by build tooling.
- Structured theme data is preferred over render-ready HTML fragments.
- Every HTML route receives `route` metadata with `type`, `is_front_page`, `is_post_index`, `path`, and `url`.

Examples of structured contract patterns:

- `posts.items[]`
- `pagination.pages[]`
- `pagination.enabled`
- `archive.groups[]`
- `post.author`
- `post.categories[]`
- `post.tags[]`
- `taxonomies.categories[]`
- `taxonomies.tags[]`
- `post.prev`
- `post.next`

### 5.1 Markdown Rendering

For `document_type: "markdown"`, build renders common Markdown authoring conventions as part of the v0.5 presentation contract:

- tables as `<table>` markup
- strikethrough as `<s>`
- task lists as disabled checkbox inputs with `contains-task-list`, `task-list-item`, and `task-list-item-checkbox` classes
- GitHub alerts for `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and `CAUTION` as `zp-alert` aside blocks
- fenced code blocks with `language-*` classes

Markdown headings receive stable `id` attributes and generate `page.toc[]` or `post.toc[]` entries for `h2` through `h4`. Build does not add visible heading permalink UI. Mermaid fences remain code blocks such as `pre code.language-mermaid`; rendering diagrams is theme-owned progressive enhancement.

### 5.2 Post Index Capability

`features.postIndex` declares whether a theme supports rendering the post index with `index.html`.

Default:

```json
{
  "features": {
    "postIndex": true
  }
}
```

If `features.postIndex` is `false`, build treats the post index as effectively disabled even when preview-data requests `site.post_index.enabled: true`. This is a capability hint, not a validation error.

`index.html` may be rendered as:

- a front page (`route.type: "front_page"`)
- a post index (`route.type: "post_index"`)
- the legacy combined root route when the default front page and post index both use `/`

Themes should check `route.is_post_index` and `pagination.enabled` before rendering pagination UI.

There is no `route.is_post` shortcut. For post-specific branching outside `post.html`, use `{{#if_eq route.type "post"}}`.

When `site.front_page.type` is `page`, the root route renders `page.html` with `route.type: "front_page"` and `route.is_front_page: true`. The selected page's normal route is not emitted, so themes should treat the root render as the canonical page render. If `page.html` renders both `page.title` and `page.html`, use `route.is_front_page` or a single heading source to avoid duplicate H1 output on Markdown front pages.

Example:

```html
{{#if route.is_front_page}}
  <div class="prose">{{page.html}}</div>
{{#else}}
  <header>
    <h1>{{page.title}}</h1>
  </header>
  <div class="prose">{{page.html}}</div>
{{/if}}
```

Route types currently include:

- `front_page`
- `post_index`
- `page`
- `post`
- `category`
- `tag`
- `archive`
- `not_found`

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
