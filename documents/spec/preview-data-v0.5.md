# ZeroPress Preview Data Spec v0.5

> Status: Active (current preview-data contract)

## 0. Core Philosophy

- Preview-data is the canonical theme-facing content payload.
- Preview-data is data-only and does not contain render-ready application behavior.
- Themes consume preview-data; build tooling is responsible for rendering and file emission.
- Preview-data must be safe to validate independently of CMS or build implementation details.

## 1. Scope

Preview-data v0.5 defines the public payload contract used by ZeroPress build and preview tooling.

In scope:

- Top-level preview-data payload structure
- Site metadata exposed to themes
- Content collections for authors, posts, pages, categories, and tags
- Enabled menus keyed by `menu_id`
- Optional site permalink policy
- Optional front page and post index policy
- Optional nested page path overrides
- Optional trusted site customization fields
- Contract-level safety rules for slug and route-related values

Out of scope:

- CMS authoring workflows
- Database schema or admin API request formats
- Theme manifest rules (`theme.json`)
- Host-specific request resolution beyond the emitted static files

## 2. Top-Level Contract

Preview-data v0.5 is a JSON object with the following required top-level fields:

- `version`
- `generator`
- `generated_at`
- `site`
- `content`
- `menus`
- `widgets`

Key points:

- `version` must be `"0.5"`.
- `generated_at` is a UTC date-time string.
- `content` is data-only and does not include pre-rendered archive/category/tag route arrays.
- `menus` is always present and keyed by enabled `menu_id` values.
- `widgets` is always present and keyed by enabled `widget_area_id` values.
- `custom_css` and `custom_html` are optional site customization fields.

The machine-readable schema is:

- [Preview Data v0.5 Schema](/schemas/preview-data.v0.5.schema.json)

## 3. Content Model

### 3.1 `site`

`site` contains theme-facing site metadata such as:

- `title`
- `description`
- `url`
- `mediaBaseUrl`
- `locale`
- `postsPerPage`
- `dateFormat`
- `timeFormat`
- `timezone`
- `disallowComments`
- `permalinks`
- `front_page`
- `post_index`
- `footer`

`site` may include additional future-facing fields unless otherwise restricted by the schema version.

`site.permalinks` is optional. When omitted, build tooling must use the default permalink policy.

`site.front_page` and `site.post_index` are optional. When omitted, build tooling must use the default site routing policy:

```json
{
  "front_page": { "type": "theme_index" },
  "post_index": {
    "enabled": true,
    "path": "/",
    "paginate": true
  }
}
```

`site.footer` is optional theme-facing footer display data:

```json
{
  "footer": {
    "copyright_text": "Copyright 2026 Example Corp.",
    "attribution": {
      "enabled": false
    }
  }
}
```

`copyright_text` is plain footer text. ZeroPress does not add a copyright symbol automatically.

`attribution.enabled` controls theme support for `Published with ZeroPress.` style attribution. Missing or `true` means a supporting theme may show attribution. `false` means a supporting theme should hide it.

### 3.2 `content`

`content` contains these collections:

- `authors`
- `posts`
- `pages`
- `categories`
- `tags`

Important v0.5 notes:

- Posts keep both `id` and `public_id`.
- Post `public_id` values are positive unique integers.
- Pages, categories, and tags do not carry internal ids in the public contract.
- Pages may carry optional `path` for nested page URLs.
- Post and page bodies use raw `content` plus `document_type`.
- Taxonomy membership on posts is represented by `category_slugs[]` and `tag_slugs[]`.

### 3.3 `menus`

`menus` is an object map keyed by `menu_id`.

Each menu contains:

- `name`
- `items`

Each menu item contains:

- `title`
- `url`
- `type`
- `target`
- `children`

### 3.4 Site Customization Fields

`custom_css` is optional site-level stylesheet input:

```json
{
  "custom_css": {
    "content": "body { color: rebeccapurple; }"
  }
}
```

Build tooling emits this as a generated CSS asset and links it before `</head>`.

`custom_html` is optional trusted site-level HTML input:

```json
{
  "custom_html": {
    "head_end": {
      "content": "<meta name=\"site-verification\" content=\"...\">\n<script async src=\"https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX\"></script>"
    },
    "body_end": {
      "content": "<script defer src=\"/vendor/app.js\"></script>"
    }
  }
}
```

Injection points:

| Field | Insertion point |
| --- | --- |
| `custom_html.head_end.content` | Immediately before `</head>` |
| `custom_html.body_end.content` | Immediately before `</body>` |

`custom_html` is trusted raw HTML. ZeroPress does not sanitize, escape, validate tag safety, or block closing tags inside `content`. It is intended for admin-authorized or trusted generator input such as analytics snippets, verification tags, external scripts, and site-owned `public/` vendor scripts.

Themes may also expose partial-based integration points such as `{{partial:tracker}}`. The distinction is:

- partials are theme/site template integration points
- `custom_html` is preview-data driven site/admin customization

## 4. Slug Contract

In preview-data v0.5, every content `slug` is defined as a safe single URL path segment.

This applies to:

- `content.posts[].slug`
- `content.pages[].slug`
- `content.categories[].slug`
- `content.tags[].slug`
- `content.posts[].category_slugs[]`
- `content.posts[].tag_slugs[]`

### 4.1 Allowed

- Unicode characters, including Hangul
- Letters and digits from any supported script
- Internal punctuation that does not create path ambiguity and is accepted by the schema/runtime validators

### 4.2 Forbidden

- Empty or whitespace-only values
- Path separators: `/` and `\`
- Reserved dot segments: `.` and `..`
- Percent-encoded slug segments
- ASCII control characters, including NUL

### 4.3 Security Intent

These rules exist to ensure that a preview-data slug cannot be misinterpreted as:

- a multi-segment route
- a parent-directory traversal sequence
- an encoded path-escape sequence
- an ambiguous filesystem output path

Preview-data must remain safe even when produced or consumed by tooling outside the main CMS.

## 5. Permalink Contract

Preview-data v0.5 may include `site.permalinks` to define build-time public URLs and static output paths.

Default policy:

```json
{
  "output_style": "directory",
  "posts": "/posts/:slug/",
  "pages": "/:slug/",
  "categories": "/categories/:slug/",
  "tags": "/tags/:slug/"
}
```

Supported `output_style` values:

| Value | Public URL | Output path |
| --- | --- | --- |
| `directory` | `/path/foo/` | `path/foo/index.html` |
| `html-extension` | `/path/foo` | `path/foo.html` |

The site root always outputs `index.html`.

Supported tokens:

| Collection | Tokens |
| --- | --- |
| posts | `:slug`, `:public_id`, `:year`, `:month`, `:day` |
| pages | `:slug` |
| categories | `:slug` |
| tags | `:slug` |

Token rules:

- Tokens must occupy a full path segment, such as `/posts/:public_id/`.
- Unknown tokens are contract-invalid.
- Post patterns must include `:slug` or `:public_id`.
- Page, category, and tag patterns must include `:slug`.
- Post date tokens are derived from `published_at_iso` using `site.timezone`.
- `:month` and `:day` are zero-padded.
- Literal `.html` permalink patterns are not part of v0.5.

Examples:

```json
{
  "permalinks": {
    "output_style": "html-extension",
    "posts": "/posts/:public_id",
    "pages": "/:slug/",
    "categories": "/categories/:slug/",
    "tags": "/tags/:slug/"
  }
}
```

This creates public post URLs such as `/posts/123` and output files such as `posts/123.html`.

Pages may override the page permalink pattern with `path`:

```json
{
  "title": "Preview Data v0.5",
  "slug": "preview-data-v0.5",
  "path": "spec/preview-data-v0.5"
}
```

With `html-extension`, this page has public URL `/spec/preview-data-v0.5` and output file `spec/preview-data-v0.5.html`.

For source-tree style docs, `index` can be used in the page path:

```json
{
  "title": "CLI Tools",
  "slug": "cli",
  "path": "cli/index"
}
```

With `html-extension`, this page has public URL `/cli/` and output file `cli/index.html`. A sibling page such as `path: "cli/zeropress-theme"` has public URL `/cli/zeropress-theme` and output file `cli/zeropress-theme.html`.

`path` is relative, has no leading or trailing slash, has no empty segment, and each segment follows the slug segment safety policy.

ZeroPress does not emit extensionless files. For `html-extension`, static hosts may resolve `/path/foo` to `path/foo.html` without changing the URL.

## 6. Front Page And Post Index Contract

Preview-data v0.5 may define which content owns the site root and whether a post index is emitted.

Default policy:

```json
{
  "front_page": { "type": "theme_index" },
  "post_index": {
    "enabled": true,
    "path": "/",
    "paginate": true
  }
}
```

Supported `front_page.type` values:

| Value | Behavior |
| --- | --- |
| `theme_index` | Render `theme/index.html` at `/` |
| `page` | Render the page identified by `page_slug` at `/` |
| `standalone_html` | Write trusted full HTML from `html` directly to `/index.html` |

For `front_page.type: "page"`, `page_slug` is required. The selected page is rendered at `/`, and its normal page route is not emitted. For example, if the selected page would normally render at `/home/`, only `/` is generated for that page. Sitemap, canonical, and OpenGraph URL use `/`.

For `front_page.type: "standalone_html"`, `html` must be a non-empty string. The value is trusted raw full HTML. Theme layout, theme asset rewriting, `custom_css`, and `custom_html` injection are not applied to this root file.

`post_index` controls the post list route rendered with `theme/index.html`.

| Field | Default | Meaning |
| --- | --- | --- |
| `enabled` | `true` | Whether to emit the post index route |
| `path` | `/` | Absolute public route for the post index |
| `paginate` | `true` | Whether to emit page 2+ routes |

`post_index.path` must be `/` or a safe absolute route path such as `/blog/`. It cannot include `.html`, query strings, hash fragments, empty segments, or unsafe path segments.

Post index behavior:

- `enabled: false` means page 1 and page 2+ routes are not emitted. If `path` or `paginate` are present, validators still check their type and format.
- `enabled: true` with `paginate: false` emits only page 1. `posts.items[]` contains at most `site.postsPerPage` posts and `pagination.enabled` is `false`.
- `enabled: true` with `paginate: true` emits page 1 and page 2+ routes when needed.

Theme capability can disable the post index. If `theme.json` sets `features.postIndex: false`, build treats the post index as effectively disabled even when preview-data requests it. This is a theme capability hint, not a preview-data validation error.

If `front_page.type` is not `theme_index`, an enabled post index cannot also use `/`; configure a separate `post_index.path`, such as `/blog/`, or disable the post index.

## 7. URL-Like Fields vs Slugs

Slug fields and URL-like fields have different roles.

- Slugs are safe single path segments.
- URL-like fields such as `featured_image`, `avatar`, or menu item `url` may represent either absolute URLs or safe relative paths, depending on the field contract.

A value that is valid for a URL-like field is not automatically valid for a slug field.

## 8. Validation and Enforcement Layers

Preview-data security is intentionally enforced in multiple layers.

### 8.1 Contract Validation

The schema and preview-data validator reject contract-invalid slug values before build rendering begins.

This is the layer that communicates:

- what a valid preview-data slug is
- which fields the rule applies to
- why a payload is contract-invalid

### 8.2 Build Enforcement

Build tooling must independently enforce output path safety even when preview-data has already been validated.

This is required because:

- build is an independent process
- preview-data may be produced by external tooling
- final filesystem writes must not rely on upstream validation alone

Schema validation does not replace final path-safety checks in the build engine.

## 9. Validation Profile

Errors include:

- missing required top-level fields
- invalid site field types
- missing required content fields
- invalid `document_type`
- invalid menu item structure
- invalid slug values that violate the safe single-segment contract
- invalid permalink or page path values
- invalid front page or post index values
- duplicate post `public_id` values
- invalid `custom_css` or `custom_html` object shape

Notes:

- slug validation is intentionally stricter than a plain non-empty string check
- build implementations should still reject any computed output path that attempts to escape the build root

## 10. Compatibility Notes

- `v0.5` is the current preview-data contract.
- Earlier preview-data versions are historical and may differ in content shape and route-related fields.
- Tooling may evolve, but public `v0.5` payloads must continue to satisfy the published schema and slug safety contract.

## 11. Normative vs Informative Summary

| Item | Classification | Notes |
| --- | --- | --- |
| top-level `version`, `generator`, `generated_at`, `site`, `content`, `menus`, `widgets` | Normative (Required) | Missing fields are contract-invalid |
| `content.posts[].slug`, `content.pages[].slug`, `content.categories[].slug`, `content.tags[].slug` | Normative (Required) | Must be safe single path segments |
| `content.posts[].public_id` | Normative (Required) | Must be a positive unique integer |
| `site.permalinks` | Normative (Optional) | Defines build-time URL/output policy when present |
| `site.front_page` | Normative (Optional) | Defines which content owns `/` |
| `site.post_index` | Normative (Optional) | Defines whether and where the post index is emitted |
| `content.pages[].path` | Normative (Optional) | Overrides the page permalink pattern when present |
| `custom_css` | Normative (Optional) | Site-level stylesheet input emitted as a generated CSS asset |
| `custom_html` | Normative (Optional) | Trusted raw HTML inserted before `</head>` and/or `</body>` |
| `content.posts[].category_slugs[]`, `content.posts[].tag_slugs[]` | Normative (Required) | Each referenced slug must also be a safe single path segment |
| Unicode slug content including Hangul | Informative (Allowed) | Allowed when all path-safety rules are still satisfied |
| `/`, `\`, `.`, `..`, percent-encoded slug segments, control characters | Normative (Forbidden) | Rejected for security and path clarity |
| final output path enforcement in build tooling | Normative (Required) | Must be enforced independently of schema validation |
