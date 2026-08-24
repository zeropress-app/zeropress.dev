---
description: Build reusable ZeroPress themes for Theme Runtime v0.7, including project structure, manifests, templates, partials, assets, and validation.
---

# Theme Authoring Guide

ZeroPress themes are static template packages for `runtime: "0.7"`. A theme owns markup, CSS, reusable theme assets, and optional client-side progressive enhancement. Build tooling owns preview-data validation, Markdown rendering, route generation, asset emission, sitemap/feed/search artifacts, and public file passthrough.

Use this guide when you want to build or review a real theme. Use [Theme Runtime Reference](../../reference/theme-runtime/index.md) for quick lookup, [Theme Runtime v0.7 Long-Form Spec](../../reference/theme-runtime/specs/v0.7/index.md) for exact contract details, and [Theme Manifest Runtime v0.7 Schema](https://schemas.zeropress.dev/theme-runtime/v0.7/schema.json) for machine-readable validation.

## Start From A Starter

Create a starter theme and fixture preview-data:

```bash
npx @zeropress/create-theme --name my-docs-theme --template docs
```

Preview the generated theme locally:

```bash
npx @zeropress/theme dev ./my-docs-theme/theme --data ./my-docs-theme/preview-data.json
```

Validate it:

```bash
npx @zeropress/theme validate ./my-docs-theme/theme
```

## Theme Project Shape

Required files:

```txt
theme/
  theme.json
  layout.html
  index.html
  post.html
  page.html
  assets/
    style.css
```

Common optional files:

```txt
theme/
  archive.html
  category.html
  tag.html
  404.html
  partials/
    header.html
    footer.html
    post-card.html
    content-enhancements.html
  assets/
    theme.js
```

## Keep The Theme Package Small

ZeroPress theme tooling enforces fixed package limits: 4 MiB in total, 1 MiB for any one file, and 128 entries. These are hard safety limits and do not have environment or CLI overrides. Equivalent final-root spellings such as `theme`, `theme/`, and `theme/.` are normalized before checking; the final theme input entry and entries inside the package cannot be symbolic links. Symbolic links in ancestor path components are allowed, and an accepted input root is pinned to its canonical path before use. Literal backslashes and exact empty, `.` and `..` path segments are invalid, but `..` inside an ordinary filename such as `name..txt` is allowed. Paths that collide after NFC and case normalization are rejected consistently for directory input and in-memory theme packages.

Keep reusable templates, CSS, small JavaScript, and small decorative assets in `theme/`. Put site-specific downloads, content media, videos, large font collections, and other large files in the site's public directory or media origin. Do not package `node_modules`, generated output, or source maps.

See [Theme Package Limits](../../reference/theme-runtime/package-limits/index.md) for exact counting rules and enforcement behavior.

Human diagnostics display unsafe terminal controls as visible `\uXXXX` sequences.

During local preview, accepted theme and public input roots are resolved once to canonical paths. One recursive watcher observes the pinned theme root, including hidden asset directories such as `assets/.icons`. A separate recursive public-root watcher applies a stricter ignore policy for hidden/private entries. Transient and immediately asynchronous watcher failures and deleted/recreated roots recover automatically with capped retry backoff. If the optional public root disappears, theme changes continue to rebuild while public recovery runs in the background. A root recreated as a symbolic link is not followed, and a public directory that did not exist when dev started is not introduced until restart. Live reload is appended at the end of HTML instead of matching authored `</body>` text.

`layout.html` is the shared page shell. It must contain exactly one content slot:

```html
<main>
  {{slot:content}}
</main>
```

Do not put direct `<script>` tags in `layout.html`. Put shared scripts in a partial such as `{{partial:content-enhancements}}`, then include that partial from the layout.

## Site Project Shape

When you build directly with `@zeropress/build`, the normal site shape is:

```txt
my-site/
  preview-data.json
  theme/
    theme.json
    layout.html
    index.html
    post.html
    page.html
    partials/
    assets/
      style.css
      theme.js
  public/
    favicon.ico
    robots.txt
    sitemap.xsl
    vendor/
```

Responsibilities:

- `preview-data.json` owns content, site metadata, menus, widgets, collections, and routing policy.
- `theme/` owns deterministic rendering through the v0.7 runtime.
- `theme/assets/` owns reusable theme CSS, JavaScript, icons, and decorative images.
- `public/` owns site-specific passthrough files such as favicons, PDFs, uploaded images, source Markdown, and vendor bundles.

Theme assets are emitted under `/assets/` and may be content-hashed. CSS and JavaScript bytes are not minified or rewritten; hashes are calculated from the bytes actually emitted. Preview Data `custom_css.content` likewise preserves whitespace, comments, strings, and modern syntax after its nonblank check. References such as `/assets/style.css` and `/assets/theme.js` are rewritten to the emitted hashed path. Public files are copied from the site public root to the output root. Generated ZeroPress output wins over public files.

Reusable themes should not hard-code site-specific analytics tokens, verification tags, vendor filenames, product copy, or copyright symbols. Use named partials, documented public paths, `site.meta`, `page.data`, or `custom_html` depending on who should own the value.

## Manifest Basics

Use `runtime: "0.7"` and validate against the current schema:

```json
{
  "$schema": "https://schemas.zeropress.dev/theme-runtime/v0.7/schema.json",
  "name": "My Theme",
  "namespace": "my-company",
  "slug": "my-theme",
  "version": "1.0.0",
  "license": "MIT",
  "runtime": "0.7",
  "description": "A ZeroPress theme.",
  "features": {
    "comments": false,
    "post_index": true,
    "search": false
  },
  "menu_slots": {
    "primary": {
      "title": "Primary Menu",
      "description": "Main navigation menu"
    }
  },
  "collection_slots": {
    "featured": {
      "title": "Featured",
      "description": "Curated cards shown on the home page."
    }
  }
}
```

The theme manifest root object is closed. Unknown root fields are invalid.

Common fields:

- `name`
- `namespace`
- `slug`
- `version`
- `license`
- `runtime`
- `description`
- `features`
- `menu_slots`
- `widget_areas`
- `site_meta`
- `collection_slots`
- `links`

Use SPDX identifiers such as `MIT` for open-source themes. Use `LicenseRef-*` for commercial, marketplace, proprietary, or otherwise non-SPDX terms:

```json
{
  "license": "LicenseRef-Commercial",
  "links": {
    "marketplace": "https://example.com/theme",
    "support": "mailto:support@example.com",
    "license": "https://example.com/theme/license"
  }
}
```

`links` is optional public metadata. Supported keys are `homepage`, `repository`, `documentation`, `support`, `marketplace`, and `license`.

Theme `version` must be complete SemVer 2.0. Values such as `1`, `1.0`, `01.0.0`, `1.0.0-`, and `1.0.0-alpha..1` are invalid. Optional `author`, root `description`, and slot helper descriptions must be nonblank after trimming.

`thumbnail` may be a credential-free absolute HTTP(S) URL or a safe theme-package-relative path to an existing regular file. A relative thumbnail cannot start with `/`, contain empty, `.` or `..` segments, use backslashes or controls, or resolve outside the theme package. Directories and all symbolic links are invalid.

All `links` values are credential-free absolute HTTP(S) URLs; only `links.support` may instead be `mailto:`. Do not use `mailto:` for homepage, repository, documentation, marketplace, or license links.

Menu slot, widget-area, and collection slot ids share `^[a-z][a-z0-9_-]{0,63}$`. Their helper objects require a nonblank `title`; optional helper `description` is also nonblank when present. Collection slots describe curated collection ids and do not reuse menu-assignment semantics.

`features` is optional. If it is omitted, feature defaults are applied per flag:

| Feature | Omitted behavior | Theme author meaning |
| --- | --- | --- |
| `comments` | `false` | Add `true` only when the theme includes comments UI. |
| `post_index` | `true` | Set `false` when the theme should not render post index routes. |
| `search` | `false` | Add `true` only when the theme includes static search UI. |

## Rendering Model

The responsibility split is:

- build prepares structured route data and safe rendered content
- templates render deterministic HTML
- theme CSS styles the contract output
- theme JS progressively enhances optional UI after first render

Every HTML route receives common data:

- `site`
- `route`
- `menus`
- `widgets`
- `collections`
- `taxonomies`
- `meta`

Post routes receive `post`; page routes receive `page`; listing routes receive structured listing data such as `posts.items[]`, `pagination`, `taxonomy`, or archive groups.

### Effective site feature objects

Every route receives materialized effective objects for optional site features:

```html
{{#if site.search.enabled}}...search UI...{{/if}}
{{#if site.feed.enabled}}<a href="{{site.feed.url}}">RSS</a>{{/if}}
{{#if site.archive.enabled}}<a href="{{site.archive.url}}">Archive</a>{{/if}}
{{#if site.comments.enabled}}...site-wide comments integration...{{/if}}
```

`site.robots.allow_indexing` is always materialized from Preview Data's global fallback `robots.txt` policy and is independent from route-level discoverability. `site.search.enabled` combines the Preview Data request with `features.search`. `site.feed.enabled` also requires a canonical site URL and feed generation; its enabled URL is `/feed.xml`. `site.archive.enabled` also requires `archive.html`; its URL is `/archive/` for directory output and `/archive` for html-extension output. `site.comments.enabled` combines provider configuration, the Preview Data request, and `features.comments`.

Feed and archive do not have manifest capability flags. Do not add `features.feed` or `features.archive`. `site.post_index.enabled` is also effective and is true only when the theme supports the post index and Build Core emitted that route. Newsletter behavior is unchanged.

## Template Syntax

Templates support variable paths, conditionals, strict comparison helpers, loops, partials, partial arguments, and comments:

```html
{{#if path}}...{{#else}}...{{/if}}
{{#if path}}...{{#else_if other.path}}...{{#else}}...{{/if}}
{{#if_eq loop.index 4}}...{{/if}}
{{#if_eq route.url item.url}}...{{#else_if_starts_with route.url item.url}}...{{/if}}
{{#if_neq loop.last true}}, {{/if}}
{{#if_in route.type "post" "page" "front_page"}}...{{/if}}
{{#if_starts_with route.url item.url}}...{{/if}}
{{#for item in path}}...{{/for}}
{{partial:post-card post=post variant="compact" show_excerpt=true}}
{{! inline comment }}
{{!-- block comment --}}
```

Important rules:

- General JavaScript expressions are not supported.
- `and`, `or`, `>`, `<`, arithmetic, slicing, and array index expressions are not supported.
- Comparison helpers use strict comparison and never coerce types.
- Comparison helper branches may be mixed inside one conditional block, and the block must close with `{{/if}}`.
- Named comparison close tags are invalid in v0.7 and fail theme validation and build.
- `{{#if_eq loop.index 4}}` can match; `{{#if_eq loop.index "4"}}` does not.
- Use `{{#if site.footer.attribution}}`, not `{{#if_eq site.footer.attribution}}`, for truthiness checks.
- Unquoted partial argument values are typed literals or path aliases, not strings. Use `variant="compact"`, not `variant=compact`.

## Partials

Partials share the parent render context. Arguments are optional aliases exposed under `partial.*`, useful when one reusable fragment renders different object types.

```html
{{#for item in collections.work.items}}
  {{partial:project-card project=item variant="featured"}}
{{/for}}

{{#for post in posts.items}}
  {{partial:project-card project=post variant="compact"}}
{{/for}}
```

Inside `partials/project-card.html`, read `partial.project`:

```html
<article class="project-card project-card--{{partial.variant}}">
  <h2><a href="{{partial.project.url}}">{{partial.project.title}}</a></h2>
  {{#if partial.project.summary}}<p>{{partial.project.summary}}</p>{{/if}}
</article>
```

Missing path aliases render as empty/falsey values. Guard optional aliases with `{{#if partial.project}}` when needed.

## Route Templates

`index.html` can render:

- a front page (`route.type: "front_page"`)
- a post index (`route.type: "post_index"`)
- the default combined root route when both use `/`

Use `route` and `pagination` before rendering route-specific UI:

```html
{{#if route.is_post_index}}
  {{#for post in posts.items}}
    {{partial:post-card post=post}}
  {{/for}}

  {{#if pagination.enabled}}
    {{partial:pagination}}
  {{/if}}
{{/if}}
```

Common route fields:

- `route.type`
- `route.is_front_page`
- `route.is_post_index`
- `route.path`
- `route.url`

There is no `route.is_post`. For post-specific branching outside `post.html`, use:

```html
{{#if_eq route.type "post"}}
  {{partial:post-enhancements}}
{{/if}}
```

When a site uses a page as the front page, that page is rendered at `/`, its normal page route is not emitted, and the root render has `route.type: "front_page"`.

## Listing Data

Post lists and pagination are structured data, not pre-rendered HTML.

Post index, category, and tag routes commonly use:

- `posts.items[]`
- `pagination`
- `taxonomy` on taxonomy routes

```html
{{#for post in posts.items}}
  <article class="post-list-item">
    <h2><a href="{{post.url}}">{{post.title}}</a></h2>
    {{#if post.summary}}<p>{{post.summary}}</p>{{/if}}
    <p>{{post.published_at}} · {{post.reading_time}}</p>
  </article>
{{/for}}
```

Pagination fields include:

- `pagination.enabled`
- `pagination.current_page`
- `pagination.total_pages`
- `pagination.has_prev`
- `pagination.has_next`
- `pagination.prev_url`
- `pagination.next_url`
- `pagination.pages[]`
- `pagination.window[]`

Archive routes use `archive.groups[]`, where each group has `label`, `year`, `month`, and `items[]`. An archive route exists only when `site.archive.enabled` is true. Build Core preserves the existing pagination/grouping behavior and still renders one empty archive page for an enabled site with no posts.

## Post And Page Data

Common post fields:

- `post.title`
- `post.slug`
- `post.url`
- `post.excerpt`
- `post.summary`
- `post.featured_image`
- `post.featured_media`
- `post.html`
- `post.published_at`
- `post.published_at_iso`
- `post.updated_at`
- `post.updated_at_iso`
- `post.reading_time`
- `post.author`
- `post.categories[]`
- `post.tags[]`
- `post.prev`
- `post.next`
- `post.collection_cursors`
- `post.meta`
- `post.data`
- `post.toc[]`

Common page fields:

- `page.title`
- `page.slug`
- `page.url`
- `page.excerpt`
- `page.summary`
- `page.featured_image`
- `page.featured_media`
- `page.html`
- `page.updated_at`
- `page.updated_at_iso`
- `page.meta`
- `page.data`
- `page.collection_cursors`
- `page.toc[]`

`excerpt` is authored copy. Build Core does not fill an empty excerpt from the body; an omitted Page excerpt becomes `""` at runtime. `summary` is the effective listing and metadata value: a nonblank authored excerpt trimmed at its outer edges, or a derived visible-text summary of at most 160 Unicode code points. The same summary is propagated to listing, archive, taxonomy, collection, cursor, and adjacent-Post items.

Use `summary` for optional cards and listings, and keep authored `excerpt` for a deliberate detail lede:

```html
{{#if post.excerpt}}<p class="lede">{{post.excerpt}}</p>{{/if}}
```

Both values may be empty, so do not emit an unconditional empty paragraph. Metadata and RSS use `summary`; native/Pagefind search keeps authored excerpts and query-specific body snippets separate. A `meta.description` key is an ordinary theme/generator convention and is not interpreted by Build Core.

Every route has both site-wide `site.comments` state and a route-root `comments` context. Check `{{#if comments.enabled}}` before rendering a theme-owned island. `site.comments.enabled` covers configured provider, Preview Data `site.comments.enabled`, and theme capability; route-root `comments.enabled` additionally requires an eligible Post/Page detail route, item `allow_comments`, a positive public ID, and a valid request token for ZeroPress. Eligible contexts expose `target_type`, `target_public_id`, explicit `provider`, normalized `api_base_url`, `per_page`, `order`, and `threading`; ZeroPress contexts additionally expose `request_token`. Inactive, list, archive, taxonomy, and standalone routes expose only `{ "enabled": false }`.

Use `meta` for scalar flags and metadata. Use `data` for structured values that templates should iterate.

All user-defined `*.meta.*` and `*.data.*` values are HTML-escaped during interpolation. A metadata key ending in `_html` or `_url` does not opt into raw rendering. Use `post.html`, `page.html`, `widget.html`, or trusted `custom_html` for the corresponding explicit raw-HTML contracts.

Page update timestamps are optional. Build Pages can derive them from Git history, and direct preview-data authors may provide `page.updated_at_iso`. When present, ZeroPress formats `page.updated_at` using the site locale, timezone, date style, and time style:

```html
{{#if page.updated_at_iso}}
  <time datetime="{{page.updated_at_iso}}" data-zp-local-date>{{page.updated_at}}</time>
{{/if}}
```

Build Core always supplies the localized fallback text and the canonical ISO value. A theme may progressively enhance only explicitly marked `<time>` elements such as `data-zp-local-date` or `data-zp-local-date-time` by formatting the ISO value with the visitor's browser locale and timezone. If JavaScript, `Intl`, or ISO parsing is unavailable, leave the fallback unchanged. Themes that require canonical site-local display should not apply the browser-local enhancement.

```json
{
  "meta": {
    "layout": "case-study"
  },
  "data": {
    "facts": [
      { "label": "Role", "value": "Design Engineering" },
      { "label": "Year", "value": "2026" }
    ],
    "stack": ["ZeroPress", "Cloudflare"]
  }
}
```

```html
{{#for fact in page.data.facts}}
  <dt>{{fact.label}}</dt>
  <dd>{{fact.value}}</dd>
{{/for}}
```

If a `data` value does not match the structure a theme expects, normal template behavior applies. For example, `{{#for fact in page.data.facts}}` renders empty when `facts` is not an array.

## Page Layout Variants

ZeroPress does not use dynamic `page.<template>.html` files. Keep `page.html` as the fixed page route template, branch by scalar metadata, and delegate variant markup to named partials.

```html
{{#if_eq page.meta.layout "case-study"}}
  {{partial:page-case-study page=page}}
{{#else_if_eq page.meta.layout "landing"}}
  {{partial:page-landing page=page}}
{{#else}}
  {{partial:page-default page=page}}
{{/if}}
```

This keeps routing and validation predictable while still allowing landing pages, case studies, portfolio pages, and other page variants.

## Markdown Bodies And H1

For Markdown pages and posts, `page.html` and `post.html` may already contain the Markdown H1.

Avoid this duplicate heading pattern:

```html
<h1>{{page.title}}</h1>
{{page.html}}
```

Prefer choosing one visible H1 source. For Markdown-first documents, let the Markdown body provide the document heading:

```html
<article class="prose">
  {{page.html}}
</article>
```

If a theme intentionally expects body Markdown without a top-level heading, rendering `page.title` as an H1 is acceptable. The important rule is to choose one source for the visible H1, not both.

Build Pages may set `page.meta.source_markdown_url` for a `View this page as Markdown` link:

```html
{{#if page.meta.source_markdown_url}}
  <p class="page-source-link">
    <a href="{{page.meta.source_markdown_url}}">View this page as Markdown</a>
  </p>
{{/if}}
```

Do not assume this value exists. `@zeropress/build-pages` can disable Markdown source copying, and non-Build-Pages preview-data generators may omit it.

## Menus

Menus are optional maps from preview-data.

```html
{{#if menus.primary.items}}
  <nav aria-label="Primary">
    {{#for item in menus.primary.items}}
      <a href="{{item.url}}" target="{{item.target}}">
        {{#if item.meta.icon}}<span class="icon icon-{{item.meta.icon}}"></span>{{/if}}
        <span>{{item.title}}</span>
        {{#if item.meta.badge}}<span class="badge">{{item.meta.badge}}</span>{{/if}}
      </a>
    {{/for}}
  </nav>
{{/if}}
```

Menu items may include scalar `meta` values for custom navigation UI, such as icons, badges, and accents. Menu `meta` is not a raw HTML channel; values are escaped through normal template rendering.

Menu items should point to real navigation targets. Do not add dummy links such
as `url: "#"`, same-page placeholder hashes such as `url: "#section"`, or links
for pages that do not exist yet. A hash is valid only when it is attached to a
real path, such as `/deployment/#github-pages`, and the target page exists. Omit
future pages from the menu, or create a real stub page for the planned URL.

The built-in `{{menu:primary}}` helper renders normal menu markup. Use manual iteration when a theme needs custom icon or badge markup.

Hyphenated ids such as `docs-sidebar` are valid path segments:

```html
{{#for item in menus.docs-sidebar.items}}
  <a href="{{item.url}}">{{item.title}}</a>
{{/for}}
```

## Collections

Named collections are curated page/post groups. Use them for hero rails, featured work, quick links, docs series, portfolio highlights, and magazine sections.

Declare `collection_slots` in `theme.json` only when the theme directly references named collection paths such as `collections.featured.items`:

```json
{
  "collection_slots": {
    "featured": {
      "title": "Featured",
      "description": "Curated cards shown on the home page."
    }
  }
}
```

Do not declare site-specific collection slots when the theme only uses generic route cursors such as `page.collection_cursor` or `post.collection_cursor`. In that case, the site may choose any collection ids, and the theme stays reusable across different documentation structures.

Render matching collection data defensively:

```html
{{#if collections.featured.count}}
  <section>
    {{#for item in collections.featured.items}}
      <a href="{{item.url}}">{{item.title}}</a>
    {{/for}}
  </section>
{{/if}}
```

Detail routes can use collection cursors:

```html
{{#if page.collection_cursor.collection_title}}
  <p class="eyebrow">{{page.collection_cursor.collection_title}}</p>
{{/if}}

{{#if page.collection_cursor.next}}
  <a href="{{page.collection_cursor.next.url}}">
    Next: {{page.collection_cursor.next.title}}
  </a>
{{/if}}
```

`page.collection_cursor` and `post.collection_cursor` are convenience aliases for the first matching collection cursor in preview-data collection order. They are useful for generic docs-style previous/next pagination where the theme does not need to know the collection id.

Cursor objects expose collection metadata and route position:

```txt
collection_cursor.collection_id
collection_cursor.collection_title
collection_cursor.index
collection_cursor.position
collection_cursor.count
collection_cursor.first
collection_cursor.last
collection_cursor.prev
collection_cursor.next
```

Use `collection_title` for docs-style eyebrow or group labels when the page title itself should remain the document H1.

If a page or post belongs to multiple collections, every matching cursor remains available under `collection_cursors.<id>`:

```html
{{#if page.collection_cursors.work.next}}
  <a href="{{page.collection_cursors.work.next.url}}">
    Next: {{page.collection_cursors.work.next.title}}
  </a>
{{/if}}
```

Use `collection_cursor` for the default route-level reading order. Use `collection_cursors.<id>` when the template must render a specific collection's previous/next links.

`collection_slots` is authoring metadata only. It does not require preview-data to provide those collections and it does not change build behavior. Missing `collection_slots` is not a problem for themes that do not read `collections.<id>` directly.

## Site Metadata

Use first-class site fields for shared identity data before inventing theme-specific keys. For example, themes should prefer `site.logo.src` over `site.meta.logo_url`:

```html
<a class="brand" href="/">
  {{#if site.logo.src}}
    <img
      class="brand__logo"
      src="{{site.logo.src}}"
      alt="{{#if site.logo.alt}}{{site.logo.alt}}{{#else}}{{site.title}}{{/if}}"
    >
  {{/if}}
  <span>{{site.title}}</span>
</a>
```

`site.logo` is theme-facing render data. Its `src` is already normalized by build: public Build Pages logos remain root-relative, and admin/media-host logos may be resolved against `site.media_origin`.

`site.meta` is the site-level scalar extension area. ZeroPress does not interpret the keys and does not coerce values to match `theme.json.site_meta` hints.

Preview-data can provide:

```json
{
  "site": {
    "meta": {
      "issue": "Spring 2026",
      "show_sponsor_banner": false
    }
  }
}
```

`site_meta.type` is optional authoring guidance. Build Core does not require Preview Data to provide the hinted key or compare a provided site value against the hint. Theme manifests do not assign default values.

A reusable theme can document those optional keys in `theme.json`:

```json
{
  "site_meta": {
    "issue": {
      "title": "Issue",
      "description": "Short label shown near magazine-style content.",
      "type": "string"
    },
    "show_sponsor_banner": {
      "title": "Show Sponsor Banner",
      "description": "Whether to render the sponsor banner.",
      "type": "boolean"
    }
  }
}
```

Templates read the values from `site.meta`:

```html
{{#if site.meta.issue}}
  <p class="issue-label">{{site.meta.issue}}</p>
{{/if}}

{{#if site.meta.show_sponsor_banner}}
  {{partial:sponsor-banner}}
{{/if}}
```

String `"0"` is truthy. Boolean `false`, `null`, and an empty string are falsy.

## Footer

`site.footer` is optional theme-facing footer display data:

- `site.footer.copyright_text`: plain footer text. ZeroPress does not add a copyright symbol automatically.
- `site.footer.attribution`: normalized by build as `true` unless preview-data explicitly sets it to `false`.

Footer example:

```html
<footer class="site-footer">
  {{#if site.footer.copyright_text}}
    <p>{{site.footer.copyright_text}}</p>
  {{#else_if site.title}}
    <p>{{site.title}}</p>
  {{/if}}

  {{#if site.footer.attribution}}
    <p>Published with <a href="https://zeropress.app" target="_blank" rel="noreferrer noopener">ZeroPress</a></p>
  {{/if}}
</footer>
```

## Media

Media fields such as `post.featured_image`, `page.featured_image`, and `post.author.avatar` may be absolute URLs, root-relative paths, or relative paths.

When `site.media_origin` is non-empty, relative media paths are resolved from that HTTP(S) origin. When `site.media_origin` is empty, relative media paths are preserved as written so themes can use site-local `public/` assets. The origin cannot contain credentials, a non-root path, query, or fragment.

Generators that know media dimensions may provide `content.media[]`. When ZeroPress can match a media string to a registry entry, it adds a derived companion object:

- posts receive `post.featured_media`
- pages receive `page.featured_media`
- post authors receive `post.author.avatar_media`

Example:

```html
{{#if post.featured_media.srcset}}
  <img
    src="{{post.featured_image}}"
    srcset="{{post.featured_media.srcset}}"
    sizes="(min-width: 900px) 720px, 100vw"
    width="{{post.featured_media.width}}"
    height="{{post.featured_media.height}}"
    alt="{{post.featured_media.alt}}"
    loading="lazy"
    decoding="async"
  >
{{#else_if post.featured_image}}
  <img src="{{post.featured_image}}" alt="{{post.featured_media.alt}}" loading="lazy" decoding="async">
{{/if}}
```

`srcset` is available only when preview-data uses `site.media_delivery_mode: "media_domain"` with a non-empty `site.media_origin` and the matched image is a managed raster media file under that media origin.

## Markdown Styling

ZeroPress renders common Markdown conventions. Themes should style:

- tables
- strikethrough
- task lists
- GitHub alert blocks and Docusaurus-style admonition containers with `zp-alert`
- fenced code blocks with `language-*` and `hljs-*` classes
- raw HTML media blocks such as `figure`, `figcaption`, `picture`, `source`, `img`, `video`, and `audio`

Build-core highlights fenced code blocks with `highlight.js`. The `<code>` element keeps the `language-*` class and highlighted tokens use `hljs-*` span classes. A client-side `highlight.js` script is usually not needed for Markdown rendered by ZeroPress.

For GitHub and IDE Markdown compatibility, prefer GitHub-style alert blockquotes such as `> [!TIP]`. ZeroPress also accepts Docusaurus/VitePress-style containers such as `:::tip` when porting existing documentation. Supported container types are `note`, `info`, `tip`, `important`, `warning`, `caution`, and `danger`. `info` uses the `zp-alert--note` style, and `danger` uses the `zp-alert--caution` style. Custom container titles and attributes are ignored.

Raw HTML tables may include positive integer `rowspan` and `colspan` attributes on `th` and `td`. Cell `align` attributes are converted to `zp-align-*` classes, so table styling should cover `zp-align-left`, `zp-align-center`, and `zp-align-right`.

Raw HTML links in Markdown may preserve `target="_blank"`. ZeroPress removes other `target` values and forces `_blank` links to include `rel="noopener noreferrer"`. Themes can style `a[target="_blank"]` when they want a visible new-window marker.

Build Core uses a parser-based explicit allowlist for Post/Page HTML, Markdown raw HTML, and text-widget HTML. Links may use relative, HTTP(S), `mailto:`, or `tel:` URLs. Media and iframes may use relative or HTTP(S) URLs, protocol-relative URLs are rejected, and unsafe `srcset` candidates are removed individually. Trusted `custom_html` and standalone front-page HTML are intentionally outside this sanitizer boundary.

```css
.prose pre {
  overflow-x: auto;
  padding: 1rem;
  border-radius: 0.5rem;
}

.prose pre code {
  display: block;
}

.prose .hljs-keyword,
.prose .hljs-selector-tag {
  color: var(--code-keyword);
}

.prose .hljs-string,
.prose .hljs-attr {
  color: var(--code-string);
}

.prose .hljs-comment {
  color: var(--code-comment);
}
```

Markdown headings receive stable `id` attributes and generate `page.toc[]` or `post.toc[]` entries for `h2` through `h4`. Theme templates own the visible TOC UI:

```html
{{#if page.toc}}
  <aside class="page-toc" aria-label="Table of contents">
    <ol>
      {{#for item in page.toc}}
        <li class="toc-level-{{item.level}}">
          <a href="{{item.href}}">{{item.title}}</a>
        </li>
      {{/for}}
    </ol>
  </aside>
{{/if}}
```

Mermaid fences remain readable code blocks by default. Add client-side progressive enhancement when a theme wants diagrams.

## Search

Static search UI is theme-owned. ZeroPress native builds can emit:

Set `features.search: true` when the theme includes static search UI. Omitted `features.search` behaves like `false`, so themes without search UI do not need to declare anything.

Native search is enabled only when both conditions are true:

- preview-data omits `site.search` or sets `site.search.enabled: true`
- the active theme declares `features.search: true`

Wrap visible search UI with `site.search.enabled`; Build Core exposes this as the effective value after combining theme capability and site preference:

```html
{{#if site.search.enabled}}
  <form role="search">...</form>
{{/if}}
```

- `/_zeropress/search.json`
- `/_zeropress/search.js`
- `/_zeropress/search_pagefind.js`

The generated adapter is a dependency-free ESM module:

```js
const searchApi = await import("/_zeropress/search.js");
const result = await searchApi.search("query", { limit: 10 });
```

Themes should provide the form, result list, empty state, keyboard behavior, and dialog behavior. The search adapter provides loading, tokenization, scoring, and a Pagefind-like result shape. It uses `Intl.Segmenter(site.locale)` for non-CJK text and falls back to Unicode word matching only when Segmenter is unavailable or fails. CJK runs contribute a full token and unique bigrams; repeated occurrences still affect term frequency.

Use the following hook names when wiring theme-owned search UI. These are
conventions for theme JavaScript, not automatic ZeroPress UI behavior:

```html
{{#if site.search.enabled}}
  <form role="search" data-zp-search>
    <input type="search" data-zp-search-input>
    <button type="submit" data-zp-search-submit>Search</button>
    <p data-zp-search-status></p>
    <div data-zp-search-results></div>
  </form>
{{/if}}
```

Mark the actual searchable post/page body with `data-pagefind-body` so Pagefind post-build indexing does not accidentally include archives, tag pages, or 404 pages:

```html
<div
  class="prose"
  {{#if site.search.enabled}}{{#if_neq page.discoverability "delist"}}data-pagefind-body{{/if}}{{/if}}
>
  {{page.html}}
</div>
```

For advanced search quality, a site can run Pagefind after the ZeroPress build and replace `/_zeropress/search.js` with `/_zeropress/search_pagefind.js`. Do not probe both engines on every page view; choose the provider for the site or theme build.

See [Static Search](../static-search/index.md) for details.

## Integrations

Use named partials or trusted `custom_html` for site integrations:

```html
<head>
  {{partial:tracker}}
</head>
<body>
  {{slot:content}}
  {{partial:content-enhancements}}
</body>
```

Good uses:

- analytics snippets
- Mermaid loader
- code-copy buttons
- heading UI
- client-side datetime formatting

Preview Data supplies `custom_html` as direct trusted slot strings:

```json
{
  "custom_html": {
    "head_end": "<meta name=\"site-verification\" content=\"...\">",
    "body_end": "<script defer src=\"/vendor/app.js\"></script>"
  }
}
```

Themes that may be combined with these site integrations must render normal closing `</head>` and `</body>` tags. A configured slot that cannot find its target causes the build to fail instead of silently dropping the integration. Standalone HTML front pages are intentionally outside this injection pipeline.

Generator metadata is a site/build concern. Themes should not hard-code `<meta name="generator">`; use preview-data `site.expose_generator`.

## Discoverability

`post.discoverability` and `page.discoverability` are build policy fields, not permission or membership fields. Missing means `default`.

- `default` leaves automatic discovery unchanged.
- `noindex` adds HTML robots `noindex`.
- `delist` removes the document from automatic discovery outputs while still rendering the direct route.

Themes should not treat `discoverability` as access control. A delisted document can still appear through explicit menus, explicit collections, or manual links chosen by the site author.

## Newsletter Islands

Themes may render a newsletter CTA or island when Preview Data provides `site.newsletter` with `enabled: true`.

ZeroPress does not submit provider forms, store subscriber state, or add newsletter JavaScript artifacts. Recommended theme behavior is:

- `signup_url` and `embed_url`: use JavaScript to open an iframe modal, and fall back to the signup link when JavaScript is unavailable.
- `signup_url` only: render a normal link or CTA.
- `embed_url` only: render the iframe/modal only when JavaScript is available; hide the UI without JavaScript.
- missing, disabled, or `enabled: false`: hide the newsletter UI.

Markdown body sanitization does not open form/input fields for newsletter providers. Use a trusted public HTML iframe, an external signup link, a custom HTML slot, or a theme-owned progressive enhancement island.

Build Pages config does not expose `site.newsletter`; Build Pages sites should handle newsletter UI through public HTML, custom HTML, or theme-specific markup instead of config.

## Validation Checklist

- Use `runtime: "0.7"`.
- Validate against [Theme Manifest Runtime v0.7 Schema](https://schemas.zeropress.dev/theme-runtime/v0.7/schema.json).
- Keep `layout.html` script-free and include scripts through partials.
- Keep class names, data attributes, CSS selectors, and JS selectors aligned.
- Avoid duplicate Markdown H1 output.
- Use typed comparison literals, such as `{{#if_eq loop.index 4}}`, not string guesses such as `"4"`.
- Use `route.type`, not invented flags.
- Treat menus, widgets, collections, `site.meta`, `page.data`, and `post.data` as optional.
- Keep reusable theme files in `theme/assets/`.
- Keep site-owned files in public passthrough.
- Keep the package within the documented [Theme Package Limits](../../reference/theme-runtime/package-limits/index.md).
- Do not use footer attribution or generator meta as hard-coded theme branding.

## Reference

- [Theme Runtime Reference](../../reference/theme-runtime/index.md)
- [Theme Runtime v0.7 Long-Form Spec](../../reference/theme-runtime/specs/v0.7/index.md)
- [Theme Manifest Runtime v0.7 Schema](https://schemas.zeropress.dev/theme-runtime/v0.7/schema.json)
- [Static Search](../static-search/index.md)
- [Package Quick Starts](../../packages/index.md)
