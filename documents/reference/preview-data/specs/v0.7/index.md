# ZeroPress Preview Data Spec v0.7

> Status: Active (current preview-data contract)

This document is the long-form contract for Preview Data v0.7. Use the [Preview Data Reference](../../index.md) for quick field lookup and the [Preview Data v0.7 Schema](https://schemas.zeropress.dev/preview-data/v0.7/schema.json) for machine-readable structural validation.

Preview Data and Theme Runtime have independent versions. A v0.7 Preview Data payload is currently consumed by themes using Theme Runtime v0.7. A theme's `theme.json` therefore declares runtime `0.7`; it does not declare the Preview Data version.

## 0. Core Philosophy

- Preview Data is the canonical theme-facing content payload.
- Preview Data is data-only. It does not contain a database model, CMS workflow, or render-ready application behavior.
- Producers describe site content and policy; Build Core resolves defaults, routes, references, media, and theme context.
- The contract must be safe to validate independently of the producer that created it.
- Deterministic producers should use stable array ordering and canonical object-key ordering where the contract defines them.

## 1. Scope and Conformance

Preview Data v0.7 defines:

- the top-level payload and site metadata
- authors, posts, pages, categories, tags, and optional managed-media metadata
- optional menus, widget areas, and named collections
- search, feed, archive, permalink, front-page, post-index, discovery, and comment policies
- optional trusted CSS and HTML customization inputs
- contract-level URL, slug, timestamp, and path safety rules

It does not define:

- Studio or other CMS storage and authoring APIs
- a theme manifest or template syntax; those belong to Theme Runtime
- a comment provider's HTTP request and response schema
- deployment, hosting, or database configuration

Conformance has three relevant layers:

1. The JSON Schema describes the serializable shape and constraints that JSON Schema can express.
2. `@zeropress/preview-data-validator` enforces the complete v0.7 input contract, including semantic and normalization-aware invariants.
3. Build Core validates first, then resolves consumer defaults and derives render data and output paths.

A payload is not conforming merely because a generic JSON Schema validator accepts it. Producers and consumers must run the ZeroPress runtime validator as well.

### 1.1 Defaults are not input mutation

Schema `default` keywords are annotations. Validation returns the original object and does not add, remove, or rewrite values. Build Core may later materialize documented consumer defaults in its internal theme-facing model.

For example, omitting `site.comments.provider` is valid. The input remains unchanged after validation, while Build Core resolves the effective provider to `"zeropress"`. Omitting `site.search`, `site.feed`, or `site.archive` likewise leaves the payload unchanged while consumers interpret the requested state as enabled.

### 1.2 Closed and open objects

Unless this document explicitly identifies an extension area, contract objects are closed: unknown properties are invalid. The intentionally open areas are:

- scalar values under `meta`
- structured values under Post/Page `data`
- widget-type-specific keys under `widget.items[].settings`
- dynamic map keys for `menus`, `widgets`, and `collections`

## 2. Minimal Valid Payload

All five top-level fields and all required `site` and `content` fields remain required even when a site has no content:

```json
{
  "$schema": "https://schemas.zeropress.dev/preview-data/v0.7/schema.json",
  "version": "0.7",
  "generator": "example-generator",
  "generated_at": "2026-07-18T00:00:00Z",
  "site": {
    "title": "Example Site",
    "description": "",
    "url": "https://example.com",
    "media_origin": "",
    "locale": "en-US",
    "posts_per_page": 10,
    "date_style": "medium",
    "time_style": "none",
    "timezone": "UTC"
  },
  "content": {
    "authors": [],
    "posts": [],
    "pages": [],
    "categories": [],
    "tags": []
  }
}
```

`$schema` is optional. It is an editor and tooling hint; ZeroPress core does not interpret it during validation.

## 3. Top-Level Contract

| Field | Required | Contract |
| --- | --- | --- |
| `$schema` | No | String containing a schema URI or path hint |
| `version` | Yes | Literal string `"0.7"` |
| `generator` | Yes | Nonblank producer identifier |
| `generated_at` | Yes | Valid RFC 3339 timestamp using `Z` or a numeric UTC offset |
| `site` | Yes | Closed site configuration object |
| `content` | Yes | Closed content object |
| `menus` | No | Enabled menus keyed by menu id |
| `widgets` | No | Enabled widget areas keyed by widget-area id |
| `collections` | No | Named curated collections keyed by collection id |
| `custom_css` | No | Trusted site stylesheet input |
| `custom_html` | No | Trusted HTML injection slots |

`generated_at` is the payload generation time, not a content publication time. Runtime validation checks actual calendar dates rather than accepting a date-shaped string only. Build Core converts this value to UTC for the generated feed's `lastBuildDate`; it never substitutes the build machine clock. Numeric offsets, fractional seconds, and RFC 3339 leap seconds are normalized to their represented instant.

## 4. Site Contract

### 4.1 Required site fields

| Field | Contract |
| --- | --- |
| `title` | Nonblank string |
| `description` | String; may be empty |
| `url` | Empty string or credential-free absolute HTTP(S) origin; canonical producers emit `URL.origin` |
| `media_origin` | Empty string or absolute HTTP(S) origin |
| `locale` | Canonical BCP 47 locale |
| `posts_per_page` | Integer greater than or equal to 1 |
| `date_style` | `none`, `short`, `medium`, `long`, or `full` |
| `time_style` | `none`, `short`, `medium`, `long`, or `full` |
| `timezone` | `UTC`, a canonical IANA id, or a canonical fixed offset within `-14:00` through `+14:00` |

Build Core formats site-local fallback text from `locale`, `timezone`, `date_style`, and `time_style`. Canonical `*_at_iso` values remain the machine-readable instants. Themes may progressively enhance explicitly marked `<time datetime="...">` elements for a visitor's locale and timezone, but should preserve build-generated text when client-side formatting is unavailable.

`none` omits that date or time portion. When both styles are `none`, formatted display strings are empty while canonical timestamps remain available. Fixed offsets use the canonical `+09:00` shape, cannot exceed the real-world `±14:00` range, and must not express zero as `+00:00` or `-00:00`; use `UTC` instead.

### 4.2 Site defaults resolved by consumers

The following fields are optional. Their effective Build Core behavior when omitted is:

| Field | Effective default |
| --- | --- |
| `media_delivery_mode` | `none` |
| `expose_generator` | `true` |
| `search` | `{ "enabled": true }`, subject to theme search capability |
| `feed` | `{ "enabled": true }`, subject to canonical URL and build settings |
| `archive` | `{ "enabled": true }`, subject to `archive.html` availability |
| `robots` | `{ "allow_indexing": true }` |
| `permalinks.output_style` | `directory` |
| `permalinks.posts` | `/posts/:slug/` |
| `permalinks.pages` | `/:slug/` |
| `permalinks.categories` | `/categories/:slug/` |
| `permalinks.tags` | `/tags/:slug/` |
| `front_page` | `{ "type": "theme_index" }` |
| `post_index` | `{ "enabled": true, "path": "/", "paginate": true }` |
| `footer.attribution` | `true` |

Only some of these values appear as JSON Schema `default` annotations. The table describes Build Core behavior, not validation-time mutation.

`search`, `feed`, and `archive` are optional closed objects. Whenever one exists, `enabled` is required; `{}`, booleans, `null`, and unknown fields are invalid. Omission means requested enabled `true`.

These objects express requested state, not guaranteed output. Search is effective only when the active theme declares `features.search: true`. Feed is effective only when `site.url` is a canonical absolute URL and the build wrapper has not applied its `generateFeed: false` hard override. Archive is effective only when the active theme contains `archive.html`. Build Core exposes the resulting effective objects to themes.

When search or archive is ineffective, Build Core removes only corresponding `search` or `archive` widget items. It retains the widget area and all other items. Menus are authored data and are never rewritten or filtered based on these feature states.

`robots` is an optional closed object. When present, `allow_indexing` is required; `{}`, a boolean, `null`, or the removed `site.indexing` field is invalid. `{ "allow_indexing": false }` controls the fallback `robots.txt` policy and remains distinct from per-document `discoverability`.

`expose_generator: false` suppresses ZeroPress generator metadata. It is distinct from visible footer attribution.

### 4.3 URL classes

The contract uses different URL classes deliberately:

- `site.url`: empty or a credential-free HTTP(S) origin only. A trailing root slash is accepted; canonical producers emit `URL.origin` without it.
- `site.media_origin`: empty or an HTTP(S) origin only. Credentials, a non-root path, query, and fragment are forbidden. A trailing root slash is accepted; canonical producers should omit it.
- navigation fields such as menu and newsletter URLs: a credential-free absolute HTTP(S) URL or a safe single-slash root-relative URL. `/` is allowed.
- media fields such as favicons, logos, avatars, featured images, and managed-media sources: the same absolute/root-relative policy, but a real non-root path is required, so `/` alone is invalid.
- comments API base: an absolute HTTP(S) URL or a single-slash root-relative path, without credentials, query, or fragment.

Navigation and media URLs reject bare or dot-relative paths, protocol-relative URLs, path dot segments, whitespace, backslashes, control characters, malformed percent encoding, credentials, and unsafe schemes. Query strings and fragments are allowed for navigation and media URLs. Comments API URLs continue to reject query strings and fragments. Runtime validation uses WHATWG URL parsing to check hostname, port, IP address, and URL syntax; JSON Schema `format` is descriptive annotation rather than a substitute for the ZeroPress runtime validator.

### 4.4 Media origin and delivery

`site.media_origin` replaces the pre-v0.7 media-base URL model. A non-empty value identifies only an origin:

```json
{
  "media_origin": "https://media.example.com",
  "media_delivery_mode": "media_domain"
}
```

Build Core resolves accepted root-relative media values such as `/images/cover.jpg` against this origin. Absolute external URLs remain external. When `media_origin` is empty, root-relative values remain same-host paths. Bare and dot-relative media values are not valid v0.7 input.

This normalization applies to:

- author avatars
- Post and Page featured images
- `content.media[].src`
- favicon and logo values
- profile-widget avatars

`media_delivery_mode` supports:

| Value | Meaning |
| --- | --- |
| `none` | Preserve normalized media URLs without deriving responsive variant URLs |
| `media_domain` | Allow responsive variants for matching managed raster media at `media_origin` |

Omitting `media_delivery_mode` means `none`. Selecting `media_domain` with an empty `media_origin` is a hard validation error.

`media_domain` does not make every image managed. Build Core derives `srcset` only when the normalized image exactly matches a `content.media` entry, is served from the configured origin, and has a supported raster extension.

### 4.5 Favicon and logo

`site.favicon` is optional and must contain at least one URL when present:

```json
{
  "favicon": {
    "icon": "/favicon.ico",
    "icon_dark": "/favicon.dark.ico",
    "svg": "/favicon.svg",
    "png": "/favicon.png",
    "apple_touch_icon": "/apple-touch-icon.png"
  }
}
```

`icon_dark` is the color-scheme-specific dark icon. Build wrappers may auto-discover conventional public favicon files when the first-class field is omitted; that wrapper behavior does not change the Preview Data input contract.

`site.logo` is optional theme-facing identity data:

```json
{
  "logo": {
    "src": "/logo.svg",
    "alt": "Example Site"
  }
}
```

`src` is required when the object exists. `alt` is optional and may be empty; a theme may fall back to `site.title` when it is omitted.

### 4.6 Newsletter

`site.newsletter` is optional theme-facing CTA or island data:

```json
{
  "newsletter": {
    "enabled": true,
    "title": "Subscribe",
    "description": "Get new posts by email.",
    "button_label": "Subscribe",
    "signup_url": "https://example.com/newsletter",
    "embed_url": "/newsletter/embed"
  }
}
```

`enabled` is required. When it is `true`, `signup_url`, `embed_url`, or both are required. Display strings are optional and themes own fallback copy. The contract does not define provider submission behavior or provider-specific JavaScript.

### 4.7 Comments

`site.comments` is optional provider configuration and requested state. Omitting it means no provider is configured and comment runtime is unavailable. If present, both `enabled` and `api_base_url` are required:

```json
{
  "comments": {
    "enabled": true,
    "api_base_url": "https://comments.example.com/api",
    "provider": "zeropress",
    "per_page": 50,
    "order": "desc",
    "threading": {
      "enabled": true,
      "max_depth": 2
    }
  }
}
```

Consumer defaults are:

| Field | Default | Range or values |
| --- | --- | --- |
| `enabled` | No default; required | Boolean |
| `provider` | `zeropress` | `zeropress`, `wordpress` |
| `per_page` | `50` | Integer 1–100 |
| `order` | `desc` | `asc`, `desc` |
| `threading.enabled` | `true` | Boolean |
| `threading.max_depth` | `2` | Integer 2–10 |

Build Core removes trailing slashes from `api_base_url`, except for the root-relative value `/`.

Validation requires an item request token when all of these data-only conditions hold, regardless of the theme selected later:

- `site.comments` exists
- `site.comments.enabled` is `true`
- the effective provider is `zeropress`
- the item has `allow_comments: true`

That item must contain:

```json
{
  "comments": {
    "request_token": "opaque-public-token"
  }
}
```

The token must be nonblank and at most 512 Unicode code points. Its provider-specific internal format is intentionally outside this contract.

Build Core exposes an enabled comment context for an individual Post or Page only when all of these runtime conditions hold:

- the theme declares `features.comments: true`
- `site.comments` exists
- `site.comments.enabled` is `true`
- the item has `allow_comments: true`
- the item has a positive `public_id`
- for the ZeroPress provider, the item has a valid `comments.request_token`

For the WordPress provider or an otherwise inactive comment state, item-level `comments` metadata is optional rather than forbidden. If present, it must still have the valid closed-object shape. Build Core drops ignored request metadata and never exposes a request token in the WordPress or inactive theme context.

### 4.8 Footer and scalar metadata

`site.footer` is optional:

```json
{
  "footer": {
    "copyright_text": "Example Site",
    "attribution": false
  }
}
```

`copyright_text`, when present, is nonblank. Missing or `true` attribution allows a supporting theme to show ZeroPress attribution; `false` asks it to hide that UI.

`site.meta` is an optional generator-defined scalar extension object. Values may be strings, finite numbers, booleans, or `null`. ZeroPress core does not interpret its keys.

## 5. Content Contract

`content` is closed and requires all of these arrays:

- `authors`
- `posts`
- `pages`
- `categories`
- `tags`

`media` is optional.

### 5.1 Authors

```json
{
  "id": "editor",
  "display_name": "Example Editor",
  "avatar": "/avatars/editor.jpg"
}
```

`id` and `display_name` are required and nonblank. `avatar` is optional and follows the general media URL policy. Author ids must be unique, and every Post `author_id` must resolve to one exported author.

### 5.2 Posts

Every Post requires:

| Field | Contract |
| --- | --- |
| `public_id` | Positive integer, unique within Posts |
| `title` | Nonblank string |
| `slug` | Safe slug segment |
| `content` | String; may be empty |
| `document_type` | `plaintext`, `markdown`, or `html` |
| `excerpt` | String; may be empty |
| `published_at_iso` | Valid RFC 3339 timestamp |
| `updated_at_iso` | Valid RFC 3339 timestamp |
| `author_id` | Nonblank reference to an exported author |
| `status` | `published` or `draft` |
| `category_slugs` | Array of safe slug references |
| `tag_slugs` | Ordered array of safe slug references |

Optional fields are `featured_image`, `meta`, `data`, `discoverability`,
`allow_comments`, and conditional `comments`.

Missing Post `allow_comments` means `false`. Canonical producers emit
`allow_comments: true` only when the Post opts in to comments.

`tag_slugs` order is the theme-facing display order. Values must be unique after NFC normalization. The first tag is display-first only; it does not implicitly become a primary or SEO tag.

The global `content.tags` array has no semantic display order. Deterministic producers should sort global definitions by name and then slug. This does not alter each Post's `tag_slugs` order.

Post `public_id` is public identity, not a Studio or database-internal id. There is no Post `id` field in v0.7.

### 5.3 Pages

Every Page requires:

- `title`
- `slug`
- `content`
- `document_type`
- `status`

Optional fields are:

- `public_id`
- `path`
- `excerpt`
- `featured_image`
- `updated_at_iso`
- `meta`
- `data`
- `discoverability`
- `allow_comments`
- `comments`

Missing Page `allow_comments` means `false`. Canonical producers emit
`allow_comments: true` only when the Page opts in to comments. Setting it to
`true` requires a positive `public_id`. Page ids must be unique within Pages. A
Post and a Page may use the same numeric public id because they are different
target types.

`path` is a relative route override without leading or trailing slashes, for example `company/about`. Each component follows the slug policy. When omitted, Build Core derives the effective path from `site.permalinks.pages` and the Page slug. A producer that knows a Page hierarchy materializes it in `path`. Page leaf slugs are not identities: two Pages may both use `about` when their NFC-normalized effective paths differ. Effective Page paths must be unique after NFC normalization.

### 5.4 Categories and tags

Categories and tags require `name` and `slug`; `description` is optional. Names are nonblank, descriptions may be empty, and slugs follow the common slug contract.

Post category and tag arrays are slug references. Build Core derives matching taxonomy objects and routes from the global definitions.

### 5.5 Managed media metadata

`content.media` is optional:

```json
{
  "src": "/images/cover.jpg",
  "width": 1600,
  "height": 900,
  "alt": "Cover image"
}
```

`src`, `width`, and `height` are required. Dimensions are positive integers; `alt` is optional and may be empty. Media `src` values must be unique.

This array describes media already referenced by fields such as `featured_image` or `avatar`; it does not replace those fields. Build Core matches the normalized URL to attach dimensions and optionally derive responsive variants.

### 5.6 Document discovery

Post and Page `discoverability` is optional. Missing is equivalent to `default`; canonical producers should omit the explicit default value.

| Value | Behavior |
| --- | --- |
| `default` | Normal automatic discovery |
| `noindex` | Render the route and add HTML robots `noindex` |
| `delist` | Render the route, add `noindex`, and omit it from automatic discovery outputs |

Automatic discovery includes generated listings, sitemap, and native search where applicable. Explicit menus, named collections, and manual links are not access control and may still expose a delisted document.

### 5.7 `meta` and `data`

Post and Page `meta` is for scalar metadata. Each value must be a string, finite number, boolean, or `null`.

Post and Page `data` is for structured theme-facing data such as facts, galleries, timelines, or swatches. It must be an object and follows these limits:

- keys match `^[a-zA-Z_][a-zA-Z0-9_]*(?:-[a-zA-Z0-9_]+)*$`
- every object has at most 64 keys
- every array has at most 256 items
- nested container depth is at most 4 below the root `data` object
- values are JSON-safe strings, finite numbers, booleans, `null`, arrays, or objects

Use `meta` for simple flags and labels. Use `data` when the theme needs repeated or nested structures.

## 6. Menus, Widgets, and Collections

### 6.1 Menus

`menus` is an optional map of enabled menus. Menu ids match `^[a-z][a-z0-9_-]{0,63}$`.

```json
{
  "menus": {
    "primary": {
      "name": "Primary Menu",
      "items": [
        {
          "title": "Home",
          "url": "/",
          "target": "_self",
          "children": []
        }
      ]
    }
  }
}
```

A menu requires a nonblank `name` and an `items` array. Every item requires:

- nonblank `title`
- URL-like `url`
- `target` of `_self` or `_blank`
- recursive `children` array

Optional item `meta` is scalar extension data. `menuItem.type` is not part of v0.7; URLs are already resolved and themes should not infer behavior from a producer-specific type marker.

### 6.2 Widgets

`widgets` is an optional map of enabled widget areas. Widget-area ids use the same 1–64 character identifier shape as menu ids.

```json
{
  "widgets": {
    "sidebar": {
      "name": "Sidebar",
      "items": [
        {
          "type": "search",
          "title": "",
          "settings": {
            "placeholder": "Search..."
          }
        }
      ]
    }
  }
}
```

A widget area requires a nonblank `name` and `items`. A widget item requires nonblank `type` and a string `title`. An empty or whitespace-only title is valid and means no displayed widget title after Build Core trims it. `settings` is an optional open object whose policy belongs to the widget type and Theme Runtime.

Omitting `widgets` and providing `{}` both mean there are no enabled widget areas in Preview Data. Importers may have their own explicit fallback-generation policy before producing the final payload; that policy is not part of this contract.

### 6.3 Collections

`collections` is an optional map of curated content lists. Collection ids match `^[a-z][a-z0-9_-]{0,63}$`.

```json
{
  "collections": {
    "featured": {
      "title": "Featured",
      "description": "Selected reading",
      "items": [
        { "type": "post", "slug": "hello" },
        { "type": "page", "path": "docs/about" }
      ]
    }
  }
}
```

`items` is required. `title` is optional and nonblank when present; `description` is optional and may be empty. Each item is a closed discriminated reference. Posts use `{ "type": "post", "slug": "hello" }`; Pages use `{ "type": "page", "path": "docs/about" }`, where `path` is the Page's NFC-normalized effective route path. Providing both `slug` and `path`, or the field for the other type, is invalid. Duplicate normalized identities in one collection are invalid. Build Core requires every reference to resolve and fails the build when referenced content is missing.

## 7. Site Customization Inputs

### 7.1 Custom CSS

`custom_css` is an optional closed object:

```json
{
  "custom_css": {
    "content": ".site-title { letter-spacing: 0.02em; }"
  }
}
```

`content` is required and nonblank. Build tooling consumes it as trusted raw CSS and emits the corresponding site stylesheet asset without trimming, minifying, removing comments, or rewriting syntax. Content hashing, when enabled, uses the UTF-8 bytes actually emitted.

### 7.2 Custom HTML

`custom_html` is an optional trusted build directive outside `site` and theme runtime data:

```json
{
  "custom_html": {
    "head_end": "<meta name=\"site-verification\" content=\"example\">",
    "body_end": "<script defer src=\"/vendor/app.js\"></script>"
  }
}
```

At least one slot is required. Each supplied slot must be nonblank and no longer than 65,536 Unicode code points. Values are direct raw strings; the earlier `{ "content": "..." }` slot shape is not part of v0.7.

ZeroPress does not sanitize, escape, deduplicate, or rewrite URLs inside these strings. Build Core inserts `head_end` before `</head>` and `body_end` before `</body>` on theme-rendered HTML routes. A configured slot whose closing target is absent fails the build instead of silently discarding content.

A `front_page.type: "standalone_html"` document remains independent and does not receive favicon, generator, custom CSS, or custom HTML injection.

## 8. Slug and Path Safety

### 8.1 Slug segment policy

The shared segment policy applies to Post, Page, category, tag, Post collection references, effective Page paths, post-index paths, and literal permalink segments.

A valid segment:

- contains at least one Unicode letter or decimal digit
- may contain Unicode letters, combining marks, decimal digits, `_`, `-`, and isolated internal `.` characters
- does not begin or end with `.`
- does not contain consecutive periods
- is not `.` or `..`
- contains no slash, backslash, whitespace, control character, or percent encoding
- contains at most 200 Unicode code points after NFC normalization

Examples:

| Value | Result | Reason |
| --- | --- | --- |
| `theme-runtime-v0.6` | Valid | Isolated internal period has meaning |
| `café` | Valid | Decomposed input is accepted and evaluated after NFC normalization |
| `.draft` | Invalid | Leading period |
| `release..notes` | Invalid | Consecutive periods |
| `.` | Invalid | Reserved dot segment |
| `hello/world` | Invalid | Path separator inside one segment |

The public Schema records the normalization-aware limit using a ZeroPress extension annotation because ordinary JSON Schema length is not NFC-aware.

### 8.2 Route path rules

Permalink patterns and `post_index.path` are absolute paths beginning with `/`. Page `path` is relative and has no leading or trailing slash. These route values reject:

- empty path components
- backslashes, query strings, fragments, whitespace, controls, and percent encoding
- a literal lowercase `.html` suffix in any route segment

The literal `.html` restriction prevents a path policy from colliding with `html-extension` output handling. It does not ban meaningful internal periods from ordinary slug segments.

Build tooling must independently verify every computed output path remains within the output root. Input validation never replaces final filesystem safety checks.

## 9. Permalinks

`site.permalinks` is optional and closed:

```json
{
  "permalinks": {
    "output_style": "directory",
    "posts": "/posts/:slug/",
    "pages": "/:slug/",
    "categories": "/categories/:slug/",
    "tags": "/tags/:slug/"
  }
}
```

All members are optional independently; Build Core fills an omitted member from the defaults in section 4.2.

`output_style` values are:

| Value | Public URL and output shape for the route `/about/` |
| --- | --- |
| `directory` | Public `/about/`, output `about/index.html` |
| `html-extension` | Public `/about`, output `about.html` |

`html-extension` describes the generated filename; ZeroPress uses its extensionless clean URL in theme links, canonical metadata, sitemap, feed, and search data. For Pages only, a terminal `index` path keeps directory-index behavior: `path: "guides/index"` produces output `guides/index.html` and public URL `/guides/`.

Tokens occupy a complete path segment.

| Field | Allowed tokens | Required token |
| --- | --- | --- |
| `posts` | `:slug`, `:public_id`, `:year`, `:month`, `:day` | `:slug` or `:public_id` |
| `pages` | `:slug` | `:slug` |
| `categories` | `:slug` | `:slug` |
| `tags` | `:slug` | `:slug` |

Date tokens use the Post publication instant interpreted in `site.timezone`, not necessarily its UTC calendar date.

## 10. Front Page and Post Index

### 10.1 Front page

`site.front_page` supports:

| `type` | Additional requirement | Meaning |
| --- | --- | --- |
| `theme_index` | None | Theme index owns `/` |
| `page` | `page_path` | The Page with that effective relative route path owns `/` |
| `standalone_html` | `html` | Trusted complete HTML owns `/` |

The three shapes are closed and discriminated: fields from another branch are invalid. `page_path` is NFC-normalized and has no leading or trailing slash. Build Core requires it to resolve to an exported Page's effective path. `standalone_html` content is a complete document and bypasses theme rendering and site customization injection.

### 10.2 Post index

`site.post_index` has optional `enabled`, `path`, and `paginate` fields. Missing values resolve to `true`, `/`, and `true` respectively.

When a Page or standalone HTML owns `/`, an enabled Post index cannot also use `/`; Build Core fails the conflicting configuration. Choose a non-root index path such as `/blog/` or disable the Post index. A theme may also disable post-index capability.

## 11. Runtime-Only Semantic Invariants

The following requirements are normative even though the public JSON Schema cannot express all of them completely:

- author ids are unique
- Post `public_id` values are unique within Posts
- provided Page `public_id` values are unique within Pages
- Post slugs are unique after NFC normalization
- effective Page paths are unique after NFC normalization; duplicate Page leaf slugs are allowed when paths differ
- equal numeric ids across one Post and one Page are allowed
- every Post `author_id` resolves to an exported author
- managed-media `src` values are unique
- Post `tag_slugs` values are unique after NFC normalization
- collection Post references resolve by normalized slug, Page references resolve by normalized effective path, and references are not duplicated
- RFC 3339 values represent real calendar dates and valid clock/offset components
- slug and literal route-segment lengths are measured after NFC normalization
- URLs pass WHATWG parsing in addition to the Schema's structural patterns
- computed output paths remain safe after token substitution and output-style conversion

The validator reports errors and currently produces no warning-only results. Producers should treat any error as a rejected payload rather than attempting to guess a repaired contract value.

## 12. Deterministic Serialization

JSON object order has no semantic meaning, but stable serialization helps review, caching, and reproducible output. The validator package exports `canonicalizePreviewDataKeyOrder()` for presentation canonicalization.

That helper:

- clones rather than mutates the payload
- orders known closed-object keys according to the v0.7 Schema
- sorts dynamic map keys and open-object keys lexically
- preserves array order
- does not validate, add defaults, normalize values, or remove unknown fields

Semantic array rules still apply. In particular, Post `tag_slugs` order is meaningful and must be preserved, while global tag definition order is nonsemantic and should be emitted deterministically by producers.

## 13. Compatibility Notes

Preview Data v0.7 accepts only `version: "0.7"`. It does not include compatibility aliases for removed v0.6 fields or shapes.

Important v0.7 differences include:

- `site.media_origin` replaces `site.media_base_url`
- `site.indexing` is removed in favor of the closed `site.robots: { "allow_indexing": boolean }` object
- Page front-page and collection references use effective route paths (`page_path` and `path`) instead of Page leaf slugs
- `site.datetime_display` is removed
- Post internal `id` is removed
- `menuItem.type` is removed
- `custom_html.head_end` and `body_end` are direct strings
- favicon supports `icon_dark`
- comments are first-class site and Post/Page data
- `site.disallow_comments` is removed; `site.comments.enabled` is the positive site-level request flag
- `site.search` is a closed `{ "enabled": boolean }` object rather than a boolean
- `site.feed` and `site.archive` add independent closed generation requests with the same shape
- Pages may have public comment identity and comment policy
- widget item `title` remains required but may be empty to suppress its heading
- Page leaf slugs may repeat when effective paths differ; Post slugs and effective Page paths remain unique identities
- duplicate normalized content references within one collection are invalid
- slug/path handling permits meaningful isolated periods while enforcing dot-segment safety
- Post tag reference order is explicitly theme-facing and NFC-unique

Producers migrating from v0.6 must account for these changes directly. Historical v0.6 documents and schemas describe v0.6 only and must not be treated as alternate valid shapes for a v0.7 payload.

## 14. Normative Summary

| Area | Classification | Summary |
| --- | --- | --- |
| `version`, `generator`, `generated_at`, `site`, `content` | Required | Core payload identity and data |
| `menus`, `widgets`, `collections` | Optional | Missing values resolve to empty theme-facing maps |
| `custom_css`, `custom_html` | Optional, trusted | Build inputs rather than ordinary theme data |
| `site.search`, `site.feed`, `site.archive` | Optional | Closed `{ "enabled": boolean }` requests; omission means requested enabled |
| `site.comments` | Optional | Requires `enabled` and `api_base_url`; provider and display defaults are consumer-resolved |
| `site.robots` | Optional | Closed global indexing policy; omission means `{ "allow_indexing": true }` |
| Post/Page `comments` | Conditional/optional | Required by the enabled ZeroPress/item data policy; otherwise allowed but ignored by Build Core |
| Post `public_id` | Required | Public Post identity |
| Post/Page `allow_comments` | Optional | Omission means false; canonical producers emit true only to opt in |
| Page `public_id` | Optional/conditional | Required when Page comments are enabled |
| `meta` | Optional open scalar map | Generator/theme convention data |
| `data` | Optional bounded structured object | Repeated or nested theme-facing content |
| `site.permalinks`, `front_page`, `post_index` | Optional | Build Core resolves documented route defaults |
| slug and route safety | Required | Enforced by runtime validation and again at output planning |
| schema defaults | Informative annotations | Do not mutate validated input |
| Build Core normalization | Consumer behavior | Produces effective theme and route context after validation |
