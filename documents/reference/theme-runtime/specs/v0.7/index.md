# ZeroPress Theme Runtime Spec v0.7

> Status: Active (current manifest contract for validation and build)

This is the long-form contract document for theme runtime v0.7. It is intended for contract decisions, validator behavior, and build behavior. It is not a theme-building tutorial. For practical authoring guidance, start with [Customize a Theme](../../../../guides/theme-authoring/index.md). For day-to-day lookup and schema checks, use the [Theme Runtime Reference](../../index.md) and the [Theme Manifest Runtime v0.7 Schema](https://schemas.zeropress.dev/theme-runtime/v0.7/schema.json).

Runtime v0.7 establishes a breaking manifest and renderer boundary. Validators and Build Core accept only `runtime: "0.7"`; they do not reinterpret a v0.6 manifest. The independent theme package `version` remains author-managed, uses SemVer 2.0, and does not need to match the runtime version.

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

- `runtime` is required and must be `"0.7"`.
- `layout.html`, `index.html`, `post.html`, `page.html`, and `assets/style.css` are required.
- `archive.html`, `category.html`, `tag.html`, and `404.html` are optional.
- `partials/` is optional, but referenced partials must exist.
- `assets/theme.js` is optional and is theme-owned.
- Theme CSS and JavaScript are emitted byte-for-byte without minification or syntax rewriting; enabled asset hashes use the emitted bytes.

### 2.1 Package resource envelope

The manifest schema describes valid `theme.json` data; it cannot constrain a directory or in-memory file map. Runtime v0.7 tooling therefore applies a separate fixed resource envelope to the complete theme package:

| Resource | Maximum |
| --- | ---: |
| Package | 4 MiB |
| One file | 1 MiB |
| Entries | 128 |

Limits are inclusive and have no environment or CLI override. The final theme input directory and entries inside it cannot be symbolic links. Ancestor path components may be symbolic links; tooling pins the accepted input root to its canonical path before use.

Theme directories and in-memory theme packages use the same entry, file, and total-size limits. A schema-valid manifest does not bypass these package checks. The complete counting and enforcement policy is defined in [Theme Package Limits](../../package-limits/index.md).

## 3. `theme.json` v0.7

Minimal example:

```json
{
  "name": "My Theme",
  "namespace": "your-namespace",
  "slug": "my-theme",
  "version": "1.0.0",
  "license": "MIT",
  "runtime": "0.7"
}
```

Notable metadata supported in `v0.7`:

- `features.comments`
- `features.post_index`
- `features.search`
- `menu_slots`
- `widget_areas`
- `site_meta`
- `collection_slots`

`runtime` does not have a fallback. Missing or non-`0.7` values fail validation.

The `theme.json` root object is closed in v0.7. Unknown root fields are invalid. The previous placeholder `settings` field is not part of the active runtime contract; site-level custom values should use preview-data `site.meta`, with optional theme hints declared through `site_meta`.

`version` must be a complete SemVer 2.0 value such as `1.0.0` or `1.2.3-beta.1+build.5`. Partial versions, numeric identifiers with leading zeroes, empty prerelease/build identifiers, and consecutive dots are invalid. Optional `author` and root `description` values must be nonblank after trimming when present.

`thumbnail` accepts one of two forms:

- a credential-free absolute HTTP(S) URL
- a safe theme-package-relative path naming an existing regular file inside the theme package

A package-relative thumbnail cannot begin with `/`, contain empty, `.` or `..` segments, use a backslash, contain controls, query, or fragment, or escape through encoded separators/dot segments. Runtime validation checks the actual theme package rather than accepting a path-shaped string alone; missing files, directories, and all symbolic links are invalid.

`features` is optional. When omitted, ZeroPress treats it as an empty capability map and applies per-feature defaults:

| Feature | Omitted behavior | Meaning |
| --- | --- | --- |
| `comments` | `false` | Comments UI/API mounting is opt-in. |
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

`links` is optional and closed. Supported keys are `homepage`, `repository`, `documentation`, `support`, `marketplace`, and `license`. Every value must be a credential-free absolute HTTP(S) URL; only `support` may instead use a non-empty `mailto:` URL. Whitespace, controls, backslashes, malformed percent encoding, and credentials are invalid. ZeroPress does not require themes to be open source.

`site_meta` documents site-level scalar metadata keys that a theme understands. It is a hint for authoring tools and admin UIs, not a build-time compatibility check:

```json
{
  "site_meta": {
    "show_sponsor_banner": {
      "title": "Show Sponsor Banner",
      "description": "Whether to display the sponsor banner.",
      "type": "boolean"
    }
  }
}
```

Each `site_meta` helper requires a nonblank `title`; optional helper `description` must also be nonblank when present. `type` is optional and may recommend `string`, `number`, or `boolean` to authoring tools. The manifest does not provide defaults.

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

Menu slot, widget-area, and collection slot ids all match `^[a-z][a-z0-9_-]{0,63}$`. Their helper objects require a nonblank `title`; an optional `description` must be nonblank when present. Collection slots use their own curated-collection helper meaning rather than menu assignment semantics.

Do not declare site-specific collection slots when a theme only uses generic route cursors such as `page.collection_cursor` or `post.collection_cursor`. Generic cursor themes let each site choose its own collection ids.

Missing `site.meta` values, missing collections, and type mismatches between `site_meta` hints and preview-data values do not fail validation or build.

## 4. Template Syntax

`v0.7` supports simple control-flow, partial includes with literal or path args, and branch reduction:

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

- `slot` tags are reserved for layout composition. `layout.html` must contain exactly one `{{slot:content}}`. The other supported slots are `header`, `footer`, and `meta`; each includes its matching named partial when present. `{{slot:meta}}` is a partial slot, not the generated `meta` object.
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
- Comparison helper blocks must close with `{{/if}}`. Named comparison close tags are invalid in v0.7 and fail theme validation and build.
- Comparison operands may be string, number, boolean, or `null` literals, or path operands. `{{#if_eq loop.index 4}}` is valid, but `{{#if_eq loop.index "4"}}` does not match.
- `if_eq` and related comparison helpers require an explicit right-hand operand. Use `{{#if site.footer.attribution}}`, not `{{#if_eq site.footer.attribution}}`, for truthiness checks.

### 4.1 Conditions and loops

Missing paths, `null`, `false`, `0`, empty strings, and empty arrays are false in `{{#if path}}`. Nonempty strings (including `"false"`), nonempty arrays, and objects are true. A missing or `null` value renders as an empty string when interpolated.

`{{#for item in path}}` iterates arrays only. Missing, empty, or non-array values produce no iterations. Inside the loop, `loop.index` is zero-based and `loop.first` and `loop.last` are booleans. Nested loops use the innermost loop's metadata; the outer context resumes afterward.

The validator checks template syntax and package references. It does not prove that every data path exists in a particular build: optional values and misspelled field names can both render blank. Use the render contexts below when choosing fields.

`{{menu:primary}}` renders the `primary` menu as nested `<ul>`, `<li>`, and `<a>` elements. Missing or empty menus produce no markup. Use `menus.primary.items` for custom markup; see [menus](#58-menus-collections-and-widgets).

## 5. Rendering Semantics

- `{{path}}` is escaped by default.
- Raw HTML is only allowed through explicit trusted runtime fields such as `post.html`, `page.html`, and `widget.html`.
- User-defined values under any `*.meta.*` or `*.data.*` path are always escaped, even when a key ends in `_html` or `_url`.
- URL fields prepared by build tooling are intended for URL-bearing attributes; user-defined metadata does not inherit raw rendering from its key name.
- Structured theme data is preferred over render-ready HTML fragments.
- Every HTML route receives `route` metadata with `type`, `is_front_page`, `is_post_index`, `path`, and `url`.

Preview Data describes the **build input**. Templates receive the **render contexts** defined below, including generated URLs, rendered HTML, summaries, and resolved navigation. Input references such as collection members and widget settings are not the objects a template loops over.

- [Common context and head metadata](#55-common-render-context)
- [Post and Page details](#56-post-and-page-details)
- [Lists, pagination, and archives](#57-lists-pagination-and-archives)
- [Menus, collections, and widgets](#58-menus-collections-and-widgets)
- [Route comments](#59-route-comments)

### 5.1 Authored excerpts and effective summaries

Build Core keeps authored excerpts separate from derived presentation summaries:

```ts
post.excerpt: string; // authored Preview Data value
post.summary: string; // effective list and metadata summary

page.excerpt: string; // authored value, or "" when omitted in Preview Data
page.summary: string;
```

Build Core never replaces `excerpt` with body text. A trim-nonempty excerpt becomes `summary` after trimming only its outer whitespace and is not shortened. Otherwise, Build Core derives `summary` from rendered document text: it removes comments and `script`, `style`, `template`, and `noscript` content, removes a leading H1 whose text matches the document title, decodes entities, collapses whitespace, and limits the result to 160 Unicode code points. A truncated result includes `…` within that limit. If no visible text remains, `summary` is `""`.

The same precomputed value is exposed on Post/Page detail objects and every structured item that exposes an excerpt: `posts.items[]`, archive/taxonomy items, Post/Page collection items, collection cursor `prev`/`next`, and `post.prev`/`post.next`. Listing and card templates should guard and render `summary`; a detail lede should guard and render authored `excerpt`.

Post/Page metadata descriptions use `summary`. An ordinary detail route does not substitute `site.description`; a Page used as the front page uses the site description only when its summary is empty. RSS item descriptions use Post summaries. Native and Pagefind search keep authored excerpts distinct and continue to produce query-specific body snippets rather than substituting the general summary. Arbitrary `meta.description` keys are generator/theme metadata and have no special Runtime meaning.

### 5.2 Effective site feature state

Build Core materializes effective state on `site` for every route. Themes must read the nested `enabled` field rather than testing whether the object exists:

```ts
site.robots = { allow_indexing: boolean };

site.search = { enabled: boolean };

site.feed =
  | { enabled: false }
  | { enabled: true; url: "/feed.xml" };

site.archive =
  | { enabled: false }
  | { enabled: true; url: "/archive/" | "/archive" };

site.comments =
  | { enabled: false }
  | {
      enabled: true;
      provider: "zeropress" | "wordpress";
      api_base_url: string;
      per_page: number;
      order: "asc" | "desc";
      threading: { enabled: boolean; max_depth: number };
    };
```

`site.robots` is not a feature capability. It is the effective global fallback `robots.txt` indexing policy, always materialized from Preview Data; per-document `discoverability` remains independent.

The effective values combine Preview Data requests with runtime availability:

- search also requires `features.search: true`
- feed also requires a canonical absolute `site.url` and no `generateFeed: false` build-wrapper override
- archive also requires `archive.html`; its URL is `/archive/` for `directory` output and `/archive` for `html-extension`
- comments also require configured Preview Data `site.comments`, `site.comments.enabled: true`, and `features.comments: true`

`site.comments.enabled` describes site-wide provider availability. Use the [route comments context](#59-route-comments) to decide whether to display comments on the current Post or Page.

`site.post_index.enabled` is likewise effective: it is true only when Preview Data requests the route, the theme supports `features.post_index`, and Build Core actually generates a post-index route. Other post-index fields retain their existing meanings. Newsletter CTA/island data is provided directly through Preview Data `site.newsletter`; there is no newsletter theme capability flag.

Feed and archive are site/output controls, not theme capabilities. Do not add `features.feed` or `features.archive` to `theme.json`. When feed is effective, Build Core claims and emits `feed.xml` and adds one RSS autodiscovery link to ordinary theme-rendered routes; it does not add one to `404.html` or a standalone raw front page. Feed `lastBuildDate` is the UTC instant represented by Preview Data `generated_at`, so repeated builds of identical input do not depend on the build clock. When feed is ineffective, neither the file nor its path claim exists, so another output may use `feed.xml`.

When archive is ineffective, no archive route or output-path claim exists, so another Page or public file may use that path. When effective, the existing chronological grouping, pagination, and empty first-page behavior apply. Build Core removes ineffective search/archive widget items while preserving their widget areas and other items. Authored menu items are never rewritten or filtered.

The native search adapter embeds the canonical `site.locale`. It tokenizes non-CJK text with `Intl.Segmenter(site.locale)` and uses Unicode word matching only when Segmenter is unavailable or fails. Each CJK run contributes its full token and unique bigrams, while repeated runs continue to increase term frequency.

### 5.3 Markdown Rendering

For `document_type: "markdown"`, build renders common Markdown authoring conventions as part of the v0.7 presentation contract:

- tables as `<table>` markup
- strikethrough as `<s>`
- task lists as disabled checkbox inputs with `contains-task-list`, `task-list-item`, and `task-list-item-checkbox` classes
- GitHub alerts for `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and `CAUTION` as `zp-alert` aside blocks
- Docusaurus-style admonition containers for `note`, `info`, `tip`, `important`, `warning`, `caution`, and `danger` as `zp-alert` aside blocks
- fenced code blocks highlighted by build-core with `highlight.js`; `<code>` keeps the `language-*` class and highlighted tokens use `hljs-*` span classes

Themes should style code blocks and `hljs-*` token classes in CSS. A client-side `highlight.js` script is not required for Markdown rendered during the ZeroPress build.

For GitHub and IDE source previews, GitHub-style alert blockquotes are the most portable form. Docusaurus-style containers such as `:::tip` are supported for documentation ports. Custom container titles and attributes are ignored. `info` renders with the `zp-alert--note` class, and `danger` renders with the `zp-alert--caution` class. Markdown inside a container is parsed normally, including paragraphs, lists, code fences, nested supported containers, and safe raw HTML.

Raw HTML tables may use positive integer `rowspan` and `colspan` attributes on `th` and `td`. `align="left"`, `align="center"`, and `align="right"` are converted to `zp-align-left`, `zp-align-center`, and `zp-align-right` classes. Inline `b`, `sup`, and `sub` tags are preserved for compatibility with existing documentation tables.

Markdown documents may include a conservative subset of raw HTML. ZeroPress uses a parser-based explicit allowlist for Markdown raw HTML, Post/Page HTML content, and text-widget HTML. Safe semantic media tags such as `figure`, `figcaption`, `picture`, `source`, `video`, `audio`, and `track` are preserved. Responsive image attributes such as `img srcset`, `sizes`, `loading`, and `decoding` are allowed, with each `srcset` candidate validated separately. Native media attributes such as `controls`, `poster`, `preload`, `playsinline`, and caption `track` metadata are allowed. Links may use safe relative, HTTP(S), `mailto:`, or `tel:` URLs; media and iframes may use safe relative or HTTP(S) URLs. Protocol-relative URLs, unsupported tags, unsupported styles, event handler attributes, scripts, and unsafe or obfuscated schemes are removed. Trusted `custom_html` and `standalone_html` are outside this sanitizer boundary and remain unchanged.

Build Core 0.7.4 and later preserve limited inline presentation: `text-align: left | center | right | justify` on paragraphs and headings, and allowlisted CSS `color` values on spans. Other inline styles are removed.

Raw HTML links may use `target="_blank"`. Other `target` values are removed. When `_blank` is preserved, ZeroPress forces `rel` to include `noopener noreferrer`. Existing safe `rel` tokens are preserved, and unknown tokens are removed. The allowed `rel` tokens are `noopener`, `noreferrer`, `nofollow`, `ugc`, `sponsored`, and `external`.

Markdown headings receive stable `id` attributes and generate `page.toc[]` or `post.toc[]` entries for `h2` through `h4`. Build does not add visible heading permalink UI. Mermaid fences remain code blocks such as `pre code.language-mermaid`; rendering diagrams is theme-owned progressive enhancement.

<span id="53-post-index-capability"></span>

### 5.4 Post Index Capability

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

### 5.5 Common render context

These roots are available on every theme-rendered route. A `standalone_html` front page is emitted directly and does not evaluate theme templates.

| Root | Value |
| --- | --- |
| `site` | Normalized [site settings](../../../preview-data/specs/v0.7/index.md#4-site-contract), with [effective feature state](#52-effective-site-feature-state). |
| `route` | `type`, `is_front_page`, `is_post_index`, `path`, and `url`. Both `path` and `url` are the current public route URL, not an output filename. |
| `meta` | Generated page-head values described below. Distinct from authored `site.meta`, `post.meta`, and `page.meta`. |
| `menus` | Menu map keyed by menu ID; `{}` when none are supplied. |
| `collections` | Resolved collection map keyed by collection ID; `{}` when none are supplied. |
| `widgets` | Resolved widget-area map keyed by area ID; `{}` when none are supplied. |
| `taxonomies` | `categories` and `tags` arrays of global taxonomy items. |
| `comments` | Route-specific comments state; `{ "enabled": false }` when unavailable. |

`currentUrl` is an alias for `route.url`; `language` contains `site.locale`.

Route-specific objects are:

| Template | Additional context |
| --- | --- |
| `index.html` | `posts.items` and `pagination`. A separate theme-index front page has an empty list and disabled pagination; use collections for curated content. |
| `post.html` | `post`, a Post detail object. |
| `page.html` | `page`, a Page detail object, including a Page selected as the front page. |
| `category.html`, `tag.html` | `posts.items`, `pagination`, and `taxonomy`. |
| `archive.html` | `archive.groups` and `pagination`. |
| `404.html` | Common context only. |

Use each object's `url` for links. Build Core applies the configured permalinks and output style; a Page selected as the front page resolves to `/`.

#### Head metadata

| Fields on `meta` | Type and meaning |
| --- | --- |
| `title`, `description` | Strings prepared for the current page. |
| `canonical_url` | Absolute canonical URL, or `""` when unavailable. |
| `og_title`, `og_description`, `og_type`, `og_url`, `og_site_name`, `og_image` | Open Graph strings; unavailable values are `""`. |
| `article_published_time`, `article_modified_time` | Article timestamp strings, or `""`. |
| `robots_noindex` | Boolean indexing instruction for this route. |
| `head_tags` | Generated HTML for description, canonical, robots, Open Graph, article metadata, and RSS discovery when applicable. Does not include `<title>`. |

Render the title and head tags once in the layout's `<head>`:

```html
<title>{{meta.title}}</title>
{{meta.head_tags}}
```

Generated `meta` strings are already escaped; the renderer inserts them without double-escaping. `head_tags` is trusted generated HTML. Authored values under `site.meta`, `post.meta`, and `page.meta` remain escaped text.

### 5.6 Post and Page details

`post` and `page` combine their [document input fields](../../../preview-data/specs/v0.7/index.md#5-content-contract) with the following presentation fields. Optional fields may be absent; test them before displaying dependent UI.

| Fields on both objects | Value |
| --- | --- |
| `title`, `slug`, `url` | Document title, slug, and resolved public URL. |
| `content`, `document_type` | Source body and its `plaintext`, `markdown`, or `html` format. Render `html` for the visible body. |
| `html` | Sanitized, rendered body HTML. |
| `excerpt`, `summary` | Strings with the [authored/effective distinction](#51-authored-excerpts-and-effective-summaries). |
| `featured_image` | Normalized image URL, or `""`. |
| `featured_media` | Optional media companion described below. |
| `toc` | Markdown H2–H4 entries: `{ level, id, title, href }`. `level` is a number and `href` is a `#fragment`. An empty TOC is `[]`. |
| `updated_at_iso`, `updated_at` | Machine-readable timestamp and site-formatted display text. Pages may omit the timestamp; their display text is then `""`. |
| `meta`, `data` | Optional authored scalar metadata and structured data. |
| `collection_cursor`, `collection_cursors` | Present when the document belongs to a collection; see [collection cursors](#collection-cursors). |

Additional Post fields:

| Fields on `post` | Value |
| --- | --- |
| `public_id`, `author_id` | Input identifiers. A Page may also have `public_id`, but it is optional. |
| `published_at_iso`, `published_at` | Publication timestamp and site-formatted display text. |
| `reading_time` | Display string such as `"1 min read"`; currently English, not a numeric duration. |
| `author` | `{ id, display_name, avatar, avatar_media? }`. `avatar` is a normalized URL or `""`. |
| `categories`, `tags` | Arrays of `{ name, slug, url }`. |
| `prev`, `next` | Adjacent Post summaries or `null`. `prev` is the newer Post; `next` is the older Post. |

Adjacent Post summaries contain `title`, `slug`, `url`, `excerpt`, `summary`, `published_at`, `published_at_iso`, and optional `data`. They do not carry the complete detail object. Delisted Posts are excluded from adjacency, and a delisted Post has no adjacent neighbors. Collection cursors supply a separate, explicit reading order for both Posts and Pages.

Display dates follow `site.locale`, `site.timezone`, `site.date_style`, and `site.time_style`; the display string is empty if both styles are `none`. Use the ISO field for `<time datetime="...">`.

#### Media companions

`featured_media` and `author.avatar_media` are added when the image URL matches an entry in `content.media`:

```ts
type MediaCompanion = {
  src: string;
  width: number;
  height: number;
  alt: string;
  srcset: string;
};
```

`srcset` is `""` unless the image supports configured media-domain delivery. The companion can be absent even when the image URL is present. See [media delivery inputs](../../../preview-data/specs/v0.7/index.md#44-media-origin-and-delivery).

### 5.7 Lists, pagination, and archives

`posts` contains an `items` array for the current page. Its entries are **Post summaries**, also used in taxonomy lists and archive groups:

| Fields on a Post summary | Value |
| --- | --- |
| `title`, `slug`, `url`, `excerpt`, `summary` | Strings. |
| `published_at_iso`, `published_at`, `reading_time` | Publication timestamp and display strings. |
| `featured_image`, `featured_media` | Image URL (or `""`) and optional media companion. |
| `author` | `{ display_name, avatar, avatar_media? }`. |
| `categories`, `tags` | Arrays of `{ name, slug, url }`. |
| `meta`, `data` | Optional authored values. |

Summary entries do not include body HTML or detail-page navigation. Use `pagination.total_items` for the full listing count.

#### Pagination

```ts
type PaginationPage = { number: number; url: string; current: boolean };
type Pagination = {
  enabled: boolean;
  current_page: number;
  total_pages: number;
  total_items: number;
  has_prev: boolean;
  has_next: boolean;
  has_multiple_pages: boolean;
  prev_url: string;
  next_url: string;
  pages: PaginationPage[];
  window: Array<({ kind: "page" } & PaginationPage) | { kind: "gap" }>;
};
```

Page numbers are one-based. Unavailable previous/next URLs are `""`. `pages` contains every page link; `window` contains a shorter range with gap entries. A gap has no `number` or `url` and must not become a link. Disabled pagination has empty `pages` and `window` arrays. `enabled` can still be true for a one-page listing; use `has_multiple_pages` to hide its navigation.

#### Taxonomies and archives

- `taxonomy` on a category/tag route is `{ kind, slug, name, count }`, where `kind` is `"category"` or `"tag"` and `count` covers the full matching list.
- Global `taxonomies.categories` and `taxonomies.tags` items are `{ name, slug, url, count, description }`. `description` defaults to `""`. These arrays can include entries with count `0`; omit those links because empty taxonomy routes are not emitted.
- `archive.groups` entries are `{ label, year, month, items }`. `label` is `YYYY-MM`, `year` and `month` are numbers, and `items` contains Post summaries. Groups use the site's timezone, newest first, and cover only the current paginated slice. One month can span several archive pages.

### 5.8 Menus, collections, and widgets

#### Menus

`menus.<id>` contains `name` and `items`. Each item exposes `title`, `url`, `target`, `children`, and optional `meta`; children use the same shape. There is no derived active-item flag: compare the item's URL with `route.url` when rendering your own markup. The built-in `{{menu:<id>}}` helper adds `noopener noreferrer` for `_blank` links.

The [Preview Data menu contract](../../../preview-data/specs/v0.7/index.md#61-menus) defines how to supply menus. Manifest `menu_slots` describe expected locations; they do not create menu items.

#### Collections

`collections.<id>` is `{ id, title, description, count, items }`. Missing title or description values become `""`. `items` preserves the authored order and resolves each reference to one of:

- A Post summary from [lists](#57-lists-pagination-and-archives), with `type: "post"`.
- A Page summary with `type: "page"`, `title`, `slug`, `url`, `excerpt`, `summary`, `featured_image`, `updated_at`, `updated_at_iso`, and optional `featured_media`, `meta`, and `data`. Missing Page timestamps are `""` here.

These are resolved document values, not the input `{ type, slug }` or `{ type, path }` references. See the [Preview Data collection contract](../../../preview-data/specs/v0.7/index.md#63-collections) for authoring those references.

#### Collection cursors

A member document receives `collection_cursors.<id>` and `collection_cursor`, the first matching collection in Preview Data order:

```ts
type CollectionCursor = {
  collection_id: string;
  collection_title: string;
  index: number;
  position: number;
  count: number;
  first: boolean;
  last: boolean;
  prev: CollectionNeighbor | null;
  next: CollectionNeighbor | null;
};
type CollectionNeighbor = {
  type: "post" | "page";
  title: string;
  slug: string;
  url: string;
  excerpt: string;
  summary: string;
  featured_image: string;
  updated_at: string;
  updated_at_iso: string;
  meta?: Record<string, string | number | boolean | null>;
  data?: Record<string, unknown>;
};
```

`index` is zero-based; `position` is one-based. Neighbors are `null` at the ends. Their update-date strings are empty when unavailable, including Post neighbors. Documents outside collections have no cursor fields.

#### Widgets

`widgets.<area>` is `{ name, items }`. Each resolved widget has `id`, `type`, `title` (possibly `""`), and `empty: false`. Widgets with no usable content or unavailable features are omitted from `items`; an area itself can remain with an empty array. Guard the area's `items` rather than expecting an empty widget placeholder.

Read the resolved fields below, not the input widget's `settings`:

| Widget `type` | Resolved fields |
| --- | --- |
| `recent-posts` | `show_date`; `items` with `{ title, url, published_at, published_at_iso }`. Includes published, non-delisted Posts. |
| `categories` | `show_count`, `hierarchical`; `items` with `{ name, slug, url, count, depth }`. Categories are flat and `depth` is `0`. |
| `tags` | `show_count`; `items` with `{ name, slug, url, count }`. |
| `archives` | `items` with `{ label, url, count, year, month, meta }`. Each URL points to the archive index; `meta` is a display string such as `"3 posts"`. |
| `text` | `html`, the sanitized rendered text-widget body. |
| `link-list` | `items` with `{ label, url, target, rel }`. `_blank` links receive `noopener noreferrer` in `rel`. |
| `search` | `placeholder`, `button_label`, and `dom_id` for theme-owned search UI. |
| `profile` | `display_name`, `affiliation`, `avatar_url`, and `bio_text`, each a string. |

Category/tag widgets omit entries with no matching Posts. Archive and search widgets require their effective site feature to be enabled. Manifest `widget_areas` only describe placement.

The [Preview Data widget envelope](../../../preview-data/specs/v0.7/index.md#62-widgets) carries these type-specific `settings` inputs. Fields are optional unless needed to produce content:

| Widget `type` | Input `settings` |
| --- | --- |
| `recent-posts` | `limit` (default 5, range 1–20); `show_date` (default true). |
| `categories` | `show_count` and `hierarchical` (both default false). |
| `tags` | `limit` (default 20, range 1–100); `show_count` (default false). |
| `archives` | `limit` (default 12, range 1–120). |
| `text` | `content`; `document_type` (`plaintext`, `markdown`, or `html`, default `markdown`). |
| `link-list` | `links` array of `{ label, url, target? }`; target defaults to `_self`. Empty labels and unsupported URLs are omitted. |
| `search` | `placeholder` (default `"Search..."`); `button_label` (default `"Search"`). |
| `profile` | `display_name`, `affiliation`, `avatar`, and `bio_short`, resolved to the profile fields above. |

Integer limits are clamped to the listed range; non-integers use the default. Unknown widget types are omitted by the renderer.

### 5.9 Route comments

Read the route-root `comments` object when mounting a comments integration:

```ts
type RouteComments =
  | { enabled: false }
  | ({
      enabled: true;
      target_type: "post" | "page";
      target_public_id: number;
      api_base_url: string;
      per_page: number;
      order: "asc" | "desc";
      threading: { enabled: boolean; max_depth: number };
    } & (
      | { provider: "wordpress" }
      | { provider: "zeropress"; request_token: string }
    ));
```

An active context requires the theme's comments capability, effective site comments, a Post/Page detail route, `allow_comments: true`, and a positive integer `public_id`. A Page rendered as the front page is eligible. ZeroPress additionally requires that document's request token; WordPress does not expose a token. All other valid route contexts contain only `{ enabled: false }`. Preview Data validation still applies: omitting a required ZeroPress token is a build error.

Input document `comments` values are consumed by Build Core, not exposed as `post.comments` or `page.comments`. Provider API calls and mounting behavior belong to the theme's JavaScript; see [Media and Integrations](../../../../guides/theme-authoring/media-and-integrations/index.md#search-and-comments).

## 6. Progressive Enhancement

Theme JS may enhance optional UI after initial render, for example:

- static search UI
- comments island mounting
- client-side TOC generation
- theme toggle behavior

These are enhancements, not required core document content.

## 7. JSON Schema

Machine-readable schema:

- [Theme Manifest Runtime v0.7 Schema](https://schemas.zeropress.dev/theme-runtime/v0.7/schema.json)
