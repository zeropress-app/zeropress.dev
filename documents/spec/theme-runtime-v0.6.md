# ZeroPress Theme Runtime Spec v0.6

> Status: Active (current manifest contract for validation and build)

This is the long-form contract document for theme runtime v0.6. It is intended for contract decisions, validator behavior, and build behavior. It is not a theme-building tutorial. For practical authoring guidance, start with [Theme Authoring](../theme-authoring/index.md). For day-to-day lookup and schema checks, use the [Theme Runtime Reference](../reference/theme-runtime/index.md) and the [Theme Manifest Runtime v0.6 Schema](https://schemas.zeropress.dev/theme-runtime/v0.6/schema.json).

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

- `runtime` is required and must be `"0.6"`.
- `layout.html`, `index.html`, `post.html`, `page.html`, and `assets/style.css` are required.
- `archive.html`, `category.html`, `tag.html`, and `404.html` are optional.
- `partials/` is optional, but referenced partials must exist.
- `assets/theme.js` is optional and is theme-owned.

## 3. `theme.json` v0.6

Minimal example:

```json
{
  "name": "My Theme",
  "namespace": "your-namespace",
  "slug": "my-theme",
  "version": "0.6.0",
  "license": "MIT",
  "runtime": "0.6"
}
```

Notable metadata supported in `v0.6`:

- `features.comments`
- `features.newsletter`
- `features.post_index`
- `features.search`
- `menu_slots`
- `widget_areas`
- `site_meta`
- `collection_slots`

`runtime` does not have a fallback. Missing or non-`0.6` values fail validation.

The `theme.json` root object is closed in v0.6. Unknown root fields are invalid. The previous placeholder `settings` field is not part of the active runtime contract; site-level custom values should use preview-data `site.meta`, with optional theme hints declared through `site_meta`.

`features` is optional. When omitted, ZeroPress treats it as an empty capability map and applies per-feature defaults:

| Feature | Omitted behavior | Meaning |
| --- | --- | --- |
| `comments` | `false` | Comments UI/API mounting is opt-in. |
| `newsletter` | No core build behavior | Capability metadata only until a stronger newsletter contract exists. |
| `post_index` | `true` | Themes are assumed to support the post index unless they opt out. |
| `search` | `false` | Static search UI/artifact support is opt-in. |

`license` describes the terms under which the theme itself is distributed. Open-source themes should use one of the supported SPDX identifiers. Commercial, marketplace, proprietary, or otherwise non-SPDX themes may use a `LicenseRef-*` identifier:

```json
{
  "license": "LicenseRef-ThemeForest-Regular"
}
```

`license` is a short identifier for validation, search, and listing metadata. Human-readable license terms belong in `links.license`, not in the `license` field:

```json
{
  "license": "LicenseRef-Commercial",
  "links": {
    "homepage": "https://example.com/theme",
    "marketplace": "https://themeforest.net/item/theme/123",
    "support": "mailto:support@example.com",
    "documentation": "https://example.com/theme/docs",
    "license": "https://example.com/theme/license"
  }
}
```

`links` is optional and closed. Supported keys are `homepage`, `repository`, `documentation`, `support`, `marketplace`, and `license`. Values must be absolute `http`, `https`, or `mailto` URLs. ZeroPress does not require themes to be open source.

`site_meta` documents site-level scalar metadata keys that a theme understands. It is a hint for authoring tools and admin UIs, not a build-time compatibility check:

```json
{
  "site_meta": {
    "show_sponsor_banner": {
      "title": "Show Sponsor Banner",
      "description": "Whether to display the sponsor banner.",
      "type": "boolean",
      "default": false
    }
  }
}
```

`collection_slots` documents recommended named collection ids for curated content areas when a theme directly reads named collection paths such as `collections.cover-story.items`:

```json
{
  "collection_slots": {
    "cover-story": {
      "title": "Cover Story",
      "description": "Primary story shown as the large home-page feature."
    },
    "hero-rail": {
      "title": "Hero Rail",
      "description": "Secondary stories shown beside the cover story."
    },
    "latest-grid": {
      "title": "Latest Grid",
      "description": "Curated story grid shown below the hero area."
    }
  }
}
```

`collection_slots` is informational helper metadata. It does not require preview-data to provide those collections and it does not change build behavior. Themes can read matching resolved collection items through `collections.<id>.items[]`.

Do not declare site-specific collection slots when a theme only uses generic route cursors such as `page.collection_cursor` or `post.collection_cursor`. Generic cursor themes let each site choose its own collection ids.

Missing `site.meta` values, missing collections, and type mismatches between `site_meta` hints and preview-data values do not fail validation or build.

## 4. Template Syntax

`v0.6` supports simple control-flow, partial includes with literal or path args, and branch reduction:

```html
{{#if path}}...{{#else}}...{{/if}}
{{#if path}}...{{#else_if other.path}}...{{#else}}...{{/if}}
{{#if_eq path "literal"}}...{{#else}}...{{/if}}
{{#if_eq loop.index 4}}...{{/if}}
{{#if_eq route.url item.url}}...{{#else_if_starts_with route.url item.url}}...{{/if}}
{{#if_neq loop.last true}}, {{/if}}
{{#if_in route.type "post" "page" "front_page"}}...{{/if}}
{{#if_starts_with route.url item.url}}...{{/if}}
{{#for item in path}}...{{/for}}
{{loop.index}}
{{partial:sidebar-widgets}}
{{partial:post-list-item variant="compact" show_excerpt=true}}
{{partial:project-card project=post limit=3 fallback=null}}
{{! inline comment }}
{{!-- block comment --}}
```

Rules:

- `slot` tags are reserved for layout composition.
- `partial` tags resolve to `partials/<name>.html`.
- Partials share the current render context.
- Partial arguments are optional aliases exposed as `partial.*`; the parent context is already shared.
- Partial argument values may be double-quoted strings, typed literals (`true`, `false`, `null`, numbers), or path aliases resolved from the current render context.
- Single-segment path aliases must be known render roots or active `for` loop aliases; dotted path aliases are resolved at render time.
- Missing path aliases render as empty/falsey values. Use `{{#if partial.project}}` before relying on optional aliases.
- Unquoted values are never string literals. Use `variant="compact"` for text, not `variant=compact`.
- Variable path segments may contain letters, digits, underscores, and internal hyphens, such as `menus.docs-sidebar.items`.
- Hyphens cannot start or end a path segment, and consecutive hyphens are invalid.
- Missing or circular partial references fail validation.
- General expressions such as `and`, `or`, `>`, `<`, arithmetic, and slicing are not supported.
- `if_eq`, `if_neq`, `if_in`, and `if_starts_with` use strict comparison and never coerce types.
- Comparison helper branches may be mixed inside one conditional block. For example, an `if_eq` block may use `else_if_starts_with`.
- Close comparison helper blocks with `{{/if}}`. Concrete close tags such as `{{/if_eq}}` remain accepted in v0.6, but are planned for removal in v0.7.
- Comparison operands may be string, number, boolean, or `null` literals, or path operands. `{{#if_eq loop.index 4}}` is valid, but `{{#if_eq loop.index "4"}}` does not match.
- `if_eq` and related comparison helpers require an explicit right-hand operand. Use `{{#if site.footer.attribution}}`, not `{{#if_eq site.footer.attribution}}`, for truthiness checks.

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
- `post.featured_media`
- `page.featured_media`
- `post.author.avatar_media`
- `post.categories[]`
- `post.tags[]`
- `taxonomies.categories[]`
- `taxonomies.tags[]`
- `collections.<id>.items[]`
- `post.prev`
- `post.next`

### 5.1 Markdown Rendering

For `document_type: "markdown"`, build renders common Markdown authoring conventions as part of the v0.6 presentation contract:

- tables as `<table>` markup
- strikethrough as `<s>`
- task lists as disabled checkbox inputs with `contains-task-list`, `task-list-item`, and `task-list-item-checkbox` classes
- GitHub alerts for `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and `CAUTION` as `zp-alert` aside blocks
- Docusaurus-style admonition containers for `note`, `info`, `tip`, `important`, `warning`, `caution`, and `danger` as `zp-alert` aside blocks
- fenced code blocks highlighted by build-core with `highlight.js`; `<code>` keeps the `language-*` class and highlighted tokens use `hljs-*` span classes

Themes should style code blocks and `hljs-*` token classes in CSS. A client-side `highlight.js` script is not required for Markdown rendered during the ZeroPress build.

For GitHub and IDE source previews, GitHub-style alert blockquotes are the most portable form. Docusaurus-style containers such as `:::tip` are supported for documentation ports. Custom container titles and attributes are ignored. `info` renders with the `zp-alert--note` class, and `danger` renders with the `zp-alert--caution` class. Markdown inside a container is parsed normally, including paragraphs, lists, code fences, nested supported containers, and safe raw HTML.

Raw HTML tables may use positive integer `rowspan` and `colspan` attributes on `th` and `td`. `align="left"`, `align="center"`, and `align="right"` are converted to `zp-align-left`, `zp-align-center`, and `zp-align-right` classes. Inline `b`, `sup`, and `sub` tags are preserved for compatibility with existing documentation tables.

Markdown documents may include a conservative subset of raw HTML. ZeroPress preserves safe semantic media tags such as `figure`, `figcaption`, `picture`, `source`, `video`, `audio`, and `track`. Responsive image attributes such as `img srcset`, `sizes`, `loading`, and `decoding` are allowed. Native media attributes such as `controls`, `poster`, `preload`, `playsinline`, and caption `track` metadata are allowed. Unsupported tags, inline `style`, event handler attributes, scripts, and unsafe URLs are removed by the sanitizer.

Raw HTML links may use `target="_blank"`. Other `target` values are removed. When `_blank` is preserved, ZeroPress forces `rel` to include `noopener noreferrer`. Existing safe `rel` tokens are preserved, and unknown tokens are removed. The allowed `rel` tokens are `noopener`, `noreferrer`, `nofollow`, `ugc`, `sponsored`, and `external`.

Markdown headings receive stable `id` attributes and generate `page.toc[]` or `post.toc[]` entries for `h2` through `h4`. Build does not add visible heading permalink UI. Mermaid fences remain code blocks such as `pre code.language-mermaid`; rendering diagrams is theme-owned progressive enhancement.

### 5.2 Post Index Capability

`features.post_index` declares whether a theme supports rendering the post index with `index.html`.

Default:

```json
{
  "features": {
    "post_index": true
  }
}
```

If `features.post_index` is `false`, build treats the post index as effectively disabled even when preview-data requests `site.post_index.enabled: true`. This is a capability hint, not a validation error.

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

- [Theme Manifest Runtime v0.6 Schema](https://schemas.zeropress.dev/theme-runtime/v0.6/schema.json)
