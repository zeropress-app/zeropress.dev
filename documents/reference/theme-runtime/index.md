# Theme Runtime Reference

The theme runtime contract defines valid `theme.json` manifests, template files, template syntax, and render-context expectations for ZeroPress themes.

Use this page for quick lookup while validating a theme package or reviewing generated starter themes. To learn how to build a full theme, start with [Theme Authoring](../../theme-authoring/index.md).

## Choose The Right Document

- [Theme Authoring](../../theme-authoring/index.md): practical guide for building a complete theme.
- [Theme Runtime v0.6 Long-Form Spec](../../spec/theme-runtime-v0.6.md): normative contract details for validators and build behavior.
- [Theme Manifest Runtime v0.6 Schema](https://schemas.zeropress.dev/theme-runtime/v0.6/schema.json): machine-readable schema for `theme.json`.

## Current Schema

- [Theme Manifest Runtime v0.6 Schema](https://schemas.zeropress.dev/theme-runtime/v0.6/schema.json)

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

## Manifest Basics

`theme.json` must use `runtime: "0.6"`.

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

`features` is optional. Omitted feature flags use ZeroPress runtime defaults: `comments: false`, `post_index: true`, `search: false`, and `newsletter` remains capability metadata without core build behavior.

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

## Full Spec

The long-form spec remains available at [Theme Runtime v0.6](../../spec/theme-runtime-v0.6.md).
