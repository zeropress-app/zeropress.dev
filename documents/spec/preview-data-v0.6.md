# ZeroPress Preview Data Spec v0.6

> Status: Active (current preview-data contract)

This is the long-form contract document for preview-data v0.6. For day-to-day schema review, generated output QA, and quick field lookup, start with the [Preview Data Reference](/reference/preview-data/) and the [Preview Data v0.6 Schema](https://schemas.zeropress.dev/preview-data/v0.6/schema.json).

## 0. Core Philosophy

- Preview-data is the canonical theme-facing content payload.
- Preview-data is data-only and does not contain render-ready application behavior.
- Themes consume preview-data; build tooling is responsible for rendering and file emission.
- Preview-data must be safe to validate independently of CMS or build implementation details.

## 1. Scope

Preview-data v0.6 defines the public payload contract used by ZeroPress build and preview tooling.

In scope:

- Top-level preview-data payload structure
- Site metadata exposed to themes
- Content collections for authors, posts, pages, categories, and tags
- Optional enabled menus keyed by `menu_id`
- Optional enabled widget areas keyed by `widget_area_id`
- Optional named collections keyed by collection id
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

Preview-data v0.6 is a JSON object with the following required top-level fields:

- `version`
- `generator`
- `generated_at`
- `site`
- `content`

Key points:

- `version` must be `"0.6"`.
- `generated_at` is a UTC date-time string.
- `content` is data-only and does not include pre-rendered archive/category/tag route arrays.
- `menus` is optional and keyed by enabled `menu_id` values when present.
- `widgets` is optional and keyed by enabled `widget_area_id` values when present.
- `collections` is optional and keyed by collection id values when present.
- `custom_css` and `custom_html` are optional site customization fields.

The machine-readable schema is:

- [Preview Data v0.6 Schema](https://schemas.zeropress.dev/preview-data/v0.6/schema.json)

## 3. Content Model

### 3.1 `site`

`site` contains theme-facing site metadata such as:

- `title`
- `description`
- `url`
- `media_base_url`
- `media_delivery_mode`
- `favicon`
- `logo`
- `expose_generator`
- `search`
- `locale`
- `posts_per_page`
- `datetime_display`
- `date_style`
- `time_style`
- `timezone`
- `disallow_comments`
- `indexing`
- `permalinks`
- `front_page`
- `post_index`
- `footer`
- `meta`

`site` is a closed object in v0.6. Generator-defined site-level extension values belong under `site.meta`.

`site.media_delivery_mode` is optional and defaults to `"none"`. Supported values are:

| Value | Meaning |
| --- | --- |
| `none` | Preserve media URLs and do not derive responsive variant URLs |
| `media_domain` | Treat `site.media_base_url` as a ZeroPress media host and allow build tooling to derive variant URLs for managed raster media |

`site.favicon` is optional site-level HTML head metadata. It does not replace public file passthrough. Favicon values use the same media URL normalization as other media fields: absolute URLs are preserved, relative/root-relative values are resolved against `site.media_base_url` when it is non-empty, and relative/root-relative values are preserved when `site.media_base_url` is empty:

```json
{
  "favicon": {
    "icon": "/favicon.ico",
    "svg": "/favicon.svg",
    "png": "/favicon.png",
    "apple_touch_icon": "/apple-touch-icon.png"
  }
}
```

Build wrappers may auto-discover root-level public files such as `favicon.ico`, `favicon.svg`, `favicon.png`, and `apple-touch-icon.png` when `site.favicon` is omitted. Explicit `site.favicon` values take priority over auto-discovered public files. Auto-discovered public favicon fallback values remain public-root paths.

`site.logo` is optional site identity data for theme rendering. Logo `src` uses the same media URL normalization as other media fields:

```json
{
  "logo": {
    "src": "/logo.svg",
    "alt": "Example Docs"
  }
}
```

Use a root-relative public path for site-owned logo files, or a media-host-relative path when `site.media_base_url` points at a media host. Themes may fall back to `site.title` when `alt` is omitted. Prefer this first-class field over ad hoc keys such as `site.meta.logo_url`.

`site.expose_generator` is optional site-level HTML metadata policy. Missing or `true` means generated HTML pages include:

```html
<meta name="generator" content="ZeroPress">
```

Set `site.expose_generator` to `false` for white-label sites or when the site owner does not want to expose the generator in page metadata. This field is separate from footer attribution, which is visible theme UI.

`site.search` is an optional native static search preference. Missing or `true` allows ZeroPress native search when the active theme declares `features.search: true`. `false` disables native search artifacts and exposes `site.search: false` to templates so themes can hide search UI:

```json
{
  "site": {
    "search": false
  }
}
```

This field does not affect sitemap, feed, robots.txt, or route generation.

`site.datetime_display` is a required theme-facing datetime display preference:

| Value | Meaning |
| --- | --- |
| `static` | Themes should normally render build-generated fallback strings such as `post.published_at` |
| `client` | Themes may progressively enhance `<time datetime="...">` elements in client JavaScript |

Build-core always generates static fallback strings. A theme that does not implement client-side datetime enhancement should keep rendering the fallback.

`site.date_style` and `site.time_style` are required `Intl.DateTimeFormat` style presets used for build-generated fallback strings. Supported values are `none`, `short`, `medium`, `long`, and `full`. `none` omits that portion. If both are `none`, formatted fields such as `post.published_at` are empty strings while `post.published_at_iso` remains available for machine-readable timestamps.

Example for `locale: "en-US"`, `timezone: "Asia/Seoul"`, and `published_at_iso: "2026-05-15T13:12:34Z"`:

| `date_style` | `time_style` | Example fallback |
| --- | --- | --- |
| `short` | `short` | `5/15/26, 10:12 PM` |
| `medium` | `medium` | `May 15, 2026, 10:12:34 PM` |
| `long` | `long` | `May 15, 2026 at 10:12:34 PM GMT+9` |
| `full` | `full` | `Friday, May 15, 2026 at 10:12:34 PM Korean Standard Time` |
| `none` | `none` | empty string |

Exact punctuation may vary slightly by JavaScript runtime and ICU data. The style enum, locale, and timezone are the contract; exact localized wording is delegated to `Intl.DateTimeFormat`.

`site.indexing` is an optional fallback `robots.txt` policy. Missing or `true` means the generated fallback `robots.txt` allows indexing. `false` means the generated fallback `robots.txt` disallows all agents. This field does not stop route generation, sitemap generation, feed generation, or HTML rendering. Site-owned `public/robots.txt` files should be used for custom crawler rules and take priority over the fallback file. When a site-owned `robots.txt` exists, ZeroPress copies it as-is and does not append a `Sitemap` directive; add `Sitemap: https://example.com/sitemap.xml` manually when needed.

Build wrappers may auto-discover a root-level public `sitemap.xsl`. When discovered and `sitemap.xml` is generated, ZeroPress links it with an XML stylesheet processing instruction. This is a file emission convenience, not a preview-data field.

`site.meta` is optional scalar metadata for site/theme conventions:

```json
{
  "meta": {
    "issue": "Spring 2026",
    "show_sponsor_banner": true,
    "featured_count": 4,
    "empty_value": null
  }
}
```

ZeroPress core does not interpret `site.meta` keys. Values are passed to templates as provided. Template interpolation renders scalar values, and template conditionals use native truthiness; for example, the string `"0"` is truthy and is not coerced to `false`.

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
    "attribution": false
  }
}
```

`copyright_text` is plain footer text. ZeroPress does not add a copyright symbol automatically.

`site.footer.attribution` controls theme support for `Published with ZeroPress` style attribution. Missing or `true` means a supporting theme may show attribution. `false` means a supporting theme should hide it.

### 3.2 `content`

`content` contains these collections:

- `authors`
- `posts`
- `pages`
- `categories`
- `tags`
- `media`

`content.media` is optional managed media metadata. It is intended for generators that know image dimensions, such as admin/import pipelines:

```json
{
  "media": [
    {
      "src": "/originals/2026/05/concrete.jpg",
      "width": 1600,
      "height": 900,
      "alt": "A concrete structure in afternoon light"
    }
  ]
}
```

Each item uses:

| Field | Required | Meaning |
| --- | --- | --- |
| `src` | Yes | URL-like media source matching a post/page featured image or author avatar |
| `width` | Yes | Positive integer source image width in pixels |
| `height` | Yes | Positive integer source image height in pixels |
| `alt` | No | Plain alternate text hint |

Exact duplicate `src` values are invalid.

Important v0.6 notes:

- Posts keep both `id` and `public_id`.
- Post `public_id` values are positive unique integers.
- Pages, categories, and tags do not carry internal ids in the public contract.
- Pages may carry optional `path` for nested page URLs.
- Pages may carry optional `updated_at_iso` for page update metadata. When present, ZeroPress exposes `page.updated_at_iso`, formats `page.updated_at`, and uses the ISO timestamp for page sitemap `lastmod`.
- Post and page bodies use raw `content` plus `document_type`.
- Taxonomy membership on posts is represented by `category_slugs[]` and `tag_slugs[]`.
- Posts and pages may carry optional `discoverability` for document-level discovery policy.

Posts and pages may carry optional `data` for structured theme-facing content. Use `meta` for scalar flags and metadata; use `data` for arrays and objects that a theme may iterate:

```json
{
  "data": {
    "eyebrow": "Selected Work",
    "stack": ["ZeroPress", "Cloudflare"],
    "facts": [
      { "label": "Role", "value": "Design Engineering" },
      { "label": "Year", "value": "2026" }
    ],
    "gallery": [
      { "src": "/images/work-1.jpg", "alt": "Homepage screenshot" }
    ]
  }
}
```

`data` must be a JSON-safe object with template-safe keys. Values may be strings, finite numbers, booleans, null, arrays, or objects. `data` is not a raw HTML channel; normal template interpolation escapes values. If a theme uses `{{#for fact in page.data.facts}}` and `facts` is not an array, the loop renders empty without a build error.

Posts and pages may also carry optional `discoverability`:

| Value | Meaning |
| --- | --- |
| `default` | No special handling. This is the default when the field is omitted. |
| `noindex` | Generate the HTML route and add `<meta name="robots" content="noindex">`. Automatic lists, sitemap, feed, and native search are unchanged. |
| `delist` | Generate the HTML route, add `noindex`, and remove the document from automatic discovery outputs. |

`delist` excludes posts from generated post index pages, archive pages, category/tag pages, taxonomy counts, recent-post widgets, adjacent post cursors, feed entries, sitemap entries, and the native search index. `delist` excludes pages from sitemap entries and the native search index.

`discoverability` is not a security or permission feature. Direct URL access still works. Explicit menus, explicit collections, and manual body links can still expose the document.

### 3.3 `menus`

`menus` is an optional object map keyed by `menu_id`.

Each menu contains:

- `name`
- `items`

Each menu item contains:

- `title`
- `url`
- `type`
- `target`
- `meta` (optional scalar map)
- `children`

```json
{
  "menus": {
    "primary": {
      "name": "Primary Menu",
      "items": [
        {
          "title": "GitHub",
          "url": "https://github.com/zeropress-app",
          "type": "custom",
          "target": "_blank",
          "meta": {
            "icon": "github",
            "badge": "New",
            "accent": "green"
          },
          "children": []
        }
      ]
    }
  }
}
```

Menu item `meta` is intended for small display hints such as icons, badges, accents, or feature flags. Values must be strings, finite numbers, booleans, or null. It is not a raw HTML channel; template interpolation escapes these values normally.

Menu item `url` values should be real navigation targets. Do not use dummy
placeholder links such as `"#"` or same-page placeholder hashes such as
`"#section"` for pages that do not exist yet. A hash is valid only when it is
attached to a real path, such as `"/deployment/#github-pages"`, and the target
page exists. Leave future pages out of menus until they exist, or publish a real
stub page at the planned URL.

When `menus` is omitted, build tooling provides an empty menu map to theme render contexts.

### 3.4 `widgets`

`widgets` is an optional object map keyed by `widget_area_id`.

When `widgets` is omitted, build tooling provides an empty widget map to theme render contexts.

### 3.5 `collections`

`collections` is an optional object map keyed by collection id. A collection is a curated list of page and post references for theme-specific layouts such as cover stories, issue sections, portfolio highlights, or landing page groups.

```json
{
  "collections": {
    "cover-story": {
      "title": "Cover Story",
      "description": "Primary feature",
      "items": [
        { "type": "post", "slug": "honest-weight-of-concrete" },
        { "type": "page", "slug": "about" }
      ]
    }
  }
}
```

Collection ids use the same id style as menu and widget maps. Collection items support `type: "post"` and `type: "page"`. Build tooling resolves each item to summary data before rendering. Missing referenced slugs are build errors.

In theme render context, each resolved collection also includes a build-derived `count` field:

```txt
collections.cover-story.count
collections.cover-story.items
```

When the current post or page appears in one or more collections, build tooling also adds collection cursors to the current route object:

```txt
post.collection_cursors.cover-story.prev
post.collection_cursors.cover-story.next
page.collection_cursors.cover-story.prev
page.collection_cursors.cover-story.next
```

Build tooling also provides a default cursor alias on detail routes:

```txt
post.collection_cursor
page.collection_cursor
```

The alias points to the first matching cursor in preview-data `collections` object order. If the current post or page belongs to multiple collections, use `post.collection_cursors.<id>` or `page.collection_cursors.<id>` to select a specific collection explicitly.

These cursor fields are render-context data only. They are not preview-data input fields.

### 3.6 Site Customization Fields

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

In preview-data v0.6, every content `slug` is defined as a safe single URL path segment.

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

Preview-data v0.6 may include `site.permalinks` to define build-time public URLs and static output paths.

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
- Literal `.html` permalink patterns are not part of v0.6.

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
  "title": "Preview Data v0.6",
  "slug": "preview-data-v0.6",
  "path": "spec/preview-data-v0.6"
}
```

With `html-extension`, this page has public URL `/spec/preview-data-v0.6` and output file `spec/preview-data-v0.6.html`.

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

Preview-data v0.6 may define which content owns the site root and whether a post index is emitted.

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
- `enabled: true` with `paginate: false` emits only page 1. `posts.items[]` contains at most `site.posts_per_page` posts and `pagination.enabled` is `false`.
- `enabled: true` with `paginate: true` emits page 1 and page 2+ routes when needed.

Theme capability can disable the post index. If `theme.json` sets `features.post_index: false`, build treats the post index as effectively disabled even when preview-data requests it. This is a theme capability hint, not a preview-data validation error.

If `front_page.type` is not `theme_index`, an enabled post index cannot also use `/`; configure a separate `post_index.path`, such as `/blog/`, or disable the post index.

## 7. URL-Like Fields vs Slugs

Slug fields and URL-like fields have different roles.

- Slugs are safe single path segments.
- URL-like fields such as `featured_image`, `avatar`, or menu item `url` may represent either absolute URLs or safe relative paths, depending on the field contract.

Media fields such as `featured_image` and author `avatar` are normalized by the renderer:

- absolute URLs are preserved after protocol validation
- relative or root-relative paths are resolved against `site.media_base_url` when `media_base_url` is non-empty
- relative or root-relative paths are preserved as written when `site.media_base_url` is empty

Generated SEO fields such as `og:image` are emitted only when the resolved media value is absolute. Set `site.media_base_url` when relative media should also appear in social preview metadata.

Managed media registry matching is exact after renderer media normalization. `content.media[]` does not replace existing media string fields. The original fields remain available as-is. When ZeroPress can match a normalized media string to a registry entry, build tooling exposes a derived companion object:

- posts receive `post.featured_media`
- pages receive `page.featured_media`
- post authors receive `post.author.avatar_media`

The derived object has:

```js
{ src, width, height, alt, srcset }
```

`srcset` is generated only when all of these are true:

- `site.media_delivery_mode` is `"media_domain"`
- `site.media_base_url` is non-empty
- the matched media URL is under `site.media_base_url`
- the media source is a raster image path such as `.jpg`, `.jpeg`, `.png`, `.webp`, or `.avif`

Responsive candidates are clipped to the original image width. Variant URLs use `w=<width>&fit=scale-down&format=auto`. Body Markdown or HTML `<img>` tags are not rewritten by this contract.

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

- `v0.6` is the current preview-data contract.
- Earlier preview-data versions are historical and may differ in content shape and route-related fields.
- Tooling may evolve, but public `v0.6` payloads must continue to satisfy the published schema and slug safety contract.

## 11. Normative vs Informative Summary

| Item | Classification | Notes |
| --- | --- | --- |
| top-level `version`, `generator`, `generated_at`, `site`, `content` | Normative (Required) | Missing fields are contract-invalid |
| top-level `menus`, `widgets`, `collections` | Normative (Optional) | Missing fields are treated as empty maps by build tooling |
| `content.posts[].slug`, `content.pages[].slug`, `content.categories[].slug`, `content.tags[].slug` | Normative (Required) | Must be safe single path segments |
| `content.posts[].public_id` | Normative (Required) | Must be a positive unique integer |
| `site.permalinks` | Normative (Optional) | Defines build-time URL/output policy when present |
| `site.front_page` | Normative (Optional) | Defines which content owns `/` |
| `site.post_index` | Normative (Optional) | Defines whether and where the post index is emitted |
| `content.pages[].path` | Normative (Optional) | Overrides the page permalink pattern when present |
| `content.posts[].data`, `content.pages[].data` | Normative (Optional) | Structured JSON-safe theme-facing content |
| `content.posts[].discoverability`, `content.pages[].discoverability` | Normative (Optional) | Document-level discovery policy: `default`, `noindex`, or `delist` |
| `custom_css` | Normative (Optional) | Site-level stylesheet input emitted as a generated CSS asset |
| `custom_html` | Normative (Optional) | Trusted raw HTML inserted before `</head>` and/or `</body>` |
| `content.posts[].category_slugs[]`, `content.posts[].tag_slugs[]` | Normative (Required) | Each referenced slug must also be a safe single path segment |
| Unicode slug content including Hangul | Informative (Allowed) | Allowed when all path-safety rules are still satisfied |
| `/`, `\`, `.`, `..`, percent-encoded slug segments, control characters | Normative (Forbidden) | Rejected for security and path clarity |
| final output path enforcement in build tooling | Normative (Required) | Must be enforced independently of schema validation |
