# Theme Runtime Reference

The theme runtime contract defines valid `theme.json` manifests, template files, template syntax, and render-context expectations for ZeroPress themes.

Use this page for quick lookup while validating a theme package or reviewing generated starter themes. To learn how to build a full theme, start with [Theme Authoring](../../guides/theme-authoring/index.md).

## Choose The Right Document

- [Theme Authoring](../../guides/theme-authoring/index.md): practical guide for building a complete theme.
- [Theme Package Limits](package-limits/index.md): fixed total-size, file, and entry limits enforced by theme tooling.
- [Theme Runtime v0.7 Long-Form Spec](specs/v0.7/index.md): normative contract details for validators and build behavior.
- [Theme Manifest Runtime v0.7 Schema](https://schemas.zeropress.dev/theme-runtime/v0.7/schema.json): machine-readable schema for `theme.json`.

## Current Schema

- [Theme Manifest Runtime v0.7 Schema](https://schemas.zeropress.dev/theme-runtime/v0.7/schema.json)

## Required Theme Files

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

Optional route templates include:

- `archive.html`
- `category.html`
- `tag.html`
- `404.html`

Optional folders include:

- `partials/`
- `assets/theme.js`

## Package Resource Envelope

Theme Runtime manifest validity does not by itself make a directory or in-memory package safe to load. ZeroPress additionally enforces these fixed package limits:

| Resource | Maximum |
| --- | ---: |
| Package | 4 MiB |
| One file | 1 MiB |
| Entries | 128 |

The limits have no environment or CLI override. Every symbolic link is rejected. See [Theme Package Limits](package-limits/index.md) for counting rules, enforcement points, and asset-placement guidance.

## Manifest Basics

`theme.json` must use `runtime: "0.7"`.

Common fields:

- `name`
- `namespace`
- `slug`
- `version`
- `license`
- `runtime`
- `features`
- `menu_slots`
- `widget_areas`
- `site_meta`
- `collection_slots`
- `links`

The root manifest object is closed. Unknown root fields are invalid.

`features` is optional. Omitted `comments` and `search` mean unsupported, while omitted `post_index` means supported.

The theme's own `version` is a complete SemVer 2.0 value such as `1.0.0` or `1.2.3-beta.1+build.5`. Optional `author`, `description`, and slot helper descriptions must be nonblank after trimming when present. Menu, widget-area, and collection slot ids all use `^[a-z][a-z0-9_-]{0,63}$`.

`thumbnail` accepts either a credential-free absolute HTTP(S) URL or a safe theme-package-relative path to a regular file that exists in the package. Leading slash, empty/dot/traversal segments, backslashes, controls, query strings, and fragments are invalid for package paths. Theme links are credential-free HTTP(S) URLs, except that `links.support` may also be `mailto:`.

Each `site_meta` entry requires a title and may declare a description and a recommended scalar `type`. It does not assign, default, or validate the corresponding Preview Data value.

## Template Syntax

Templates support:

- variable paths
- `if`, `else_if`, and `else`
- `if_eq`, `if_neq`, `if_in`, and `if_starts_with`
- `for`
- loop metadata
- partials and partial arguments
- template comments

General JavaScript expressions, arithmetic, slicing, `and`, `or`, and comparison operators such as `>` are not part of the runtime syntax.

Comparison helpers use strict comparison and do not coerce types.

## Render Context

Every route receives common data such as:

- `site`
- `route`
- `menus`
- `widgets`
- `collections`
- `taxonomies`

Post routes receive `post`; page routes receive `page`; listing routes receive structured listing data such as `posts.items[]`, `pagination`, `taxonomy`, or archive groups.

Build Core always materializes effective site feature objects:

- `site.robots: { allow_indexing }`
- `site.search: { enabled }`
- `site.feed: { enabled: false } | { enabled: true, url: "/feed.xml" }`
- `site.archive: { enabled: false } | { enabled: true, url: "/archive/" | "/archive" }`
- `site.comments: { enabled: false } | { enabled: true, provider, api_base_url, per_page, order, threading }`

Check `.enabled` before rendering feature UI. `site.comments` is site-wide provider availability; the separate route-root `comments.enabled` also applies route and item eligibility. `site.post_index.enabled` reflects both theme capability and whether Build Core actually emitted the route.

`site.robots.allow_indexing` is the effective global fallback `robots.txt` policy from Preview Data. It is always available and is separate from route-level document discoverability.

Feed and archive are not manifest features. Their effective values depend on Preview Data plus build conditions; archive additionally requires `archive.html`, while feed requires a canonical site URL and feed generation. Search and comments also require their existing theme capability flags.

## Full Spec

The current long-form spec is [Theme Runtime v0.7](specs/v0.7/index.md). The previous [Theme Runtime v0.6 spec](specs/v0.6/index.md) remains available for historical review.
