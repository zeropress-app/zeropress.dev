# Theme Runtime Reference

Use this index to check a ZeroPress theme's manifest, templates, and render data.
For practical examples, start with [Customize a Theme](../../guides/theme-authoring/index.md).

The current contract is **v0.7**:
[specification](specs/v0.7/index.md) ·
[manifest JSON Schema](https://schemas.zeropress.dev/theme-runtime/v0.7/schema.json).

## Find A Topic

| Topic | Specification |
| --- | --- |
| Required and optional package files | [Runtime contract](specs/v0.7/index.md#2-runtime-contract) |
| Size limits and filesystem constraints | [Theme Package Limits](package-limits/index.md) |
| Theme identity, features, and declared slots | [Manifest](specs/v0.7/index.md#3-themejson-v07) |
| Variables, conditions, loops, and partials | [Template syntax](specs/v0.7/index.md#4-template-syntax) |
| Common roots, route contexts, and page-head metadata | [Common render context](specs/v0.7/index.md#55-common-render-context) |
| Document bodies, dates, authors, and media | [Post and Page details](specs/v0.7/index.md#56-post-and-page-details) |
| Summary items, pagination gaps, and archives | [Lists and pagination](specs/v0.7/index.md#57-lists-pagination-and-archives) |
| Resolved navigation, reading order, and widget fields | [Menus, collections, and widgets](specs/v0.7/index.md#58-menus-collections-and-widgets) |
| Per-route comment eligibility and provider fields | [Route comments](specs/v0.7/index.md#59-route-comments) |
| Authored introductions and listing text | [Excerpts and summaries](specs/v0.7/index.md#51-authored-excerpts-and-effective-summaries) |
| Search, feed, archive, and comments availability | [Effective feature state](specs/v0.7/index.md#52-effective-site-feature-state) |
| Markdown markup and sanitization | [Markdown rendering](specs/v0.7/index.md#53-markdown-rendering) |
| Front-page and post-index behavior | [Post-index capability](specs/v0.7/index.md#54-post-index-capability) |
| Optional browser interactions | [Progressive enhancement](specs/v0.7/index.md#6-progressive-enhancement) |

Validate a package with [CLI Tools](../../guides/cli/index.md#preview-and-validate).
The [version index](specs/index.md) includes earlier contracts.
