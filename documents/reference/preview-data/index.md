# Preview Data Reference

Preview Data is the JSON content input for `@zeropress/build`. Use this index
when writing a generator or importer, or validating exported site data.

The current contract is **v0.7**:
[specification](specs/v0.7/index.md) ·
[JSON Schema](https://schemas.zeropress.dev/preview-data/v0.7/schema.json).

## Find A Topic

| Topic | Specification |
| --- | --- |
| Smallest valid input | [Minimal valid payload](specs/v0.7/index.md#2-minimal-valid-payload) |
| Required fields and optional maps | [Top-level contract](specs/v0.7/index.md#3-top-level-contract) |
| Site identity, locale, timezone, and defaults | [Site contract](specs/v0.7/index.md#4-site-contract) |
| Site, media, and integration URLs | [URL classes](specs/v0.7/index.md#43-url-classes) |
| Image delivery and dimensions | [Media origin](specs/v0.7/index.md#44-media-origin-and-delivery), [media metadata](specs/v0.7/index.md#55-managed-media-metadata) |
| Posts, pages, authors, and taxonomies | [Content contract](specs/v0.7/index.md#5-content-contract) |
| Search-engine and automatic-list visibility | [Document discovery](specs/v0.7/index.md#56-document-discovery) |
| Custom scalar and structured data | [Meta and data](specs/v0.7/index.md#57-meta-and-data) |
| Menus, widgets, and curated reading order | [Menus, widgets, and collections](specs/v0.7/index.md#6-menus-widgets-and-collections) |
| CSS and trusted HTML slots | [Site customization inputs](specs/v0.7/index.md#7-site-customization-inputs) |
| Slugs and public URLs | [Path safety](specs/v0.7/index.md#8-slug-and-path-safety), [permalinks](specs/v0.7/index.md#9-permalinks) |
| Home page and post-index selection | [Front page and post index](specs/v0.7/index.md#10-front-page-and-post-index) |
| Validation beyond JSON Schema | [Semantic invariants](specs/v0.7/index.md#11-runtime-only-semantic-invariants) |
| Stable JSON output | [Deterministic serialization](specs/v0.7/index.md#12-deterministic-serialization) |

See [CLI Tools](../../guides/cli/index.md#validators) for validation tools.
The [version index](specs/index.md) includes earlier contracts.
