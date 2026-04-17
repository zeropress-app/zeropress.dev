# ZeroPress Public Docs

This site publishes public ZeroPress runtime documentation and JSON schemas.

Current contract highlights:

- Theme runtime current spec: `v0.3`
- Preview-data current schema: `v0.5`
## Theme Runtime Spec

- [Theme Runtime v0.3](/spec/theme-runtime-v0.3.md)
- [Theme Runtime v0.2](/spec/theme-runtime-v0.2.md)
- [Theme Runtime v0.1](/spec/theme-runtime-v0.1.md)

## Preview Data Spec

- [Preview Data v0.5](/spec/preview-data-v0.5.md)

## JSON Schemas

Versioned:

- [Theme Manifest Runtime v0.3](/schemas/theme.v0.3.runtime.schema.json)
- [Theme Manifest Runtime v0.2](/schemas/theme.v0.2.runtime.schema.json)
- [Theme Manifest Runtime v0.1](/schemas/theme.v0.1.runtime.schema.json)
- [Preview Data v0.5](/schemas/preview-data.v0.5.schema.json)
- [Preview Data v0.4](/schemas/preview-data.v0.4.schema.json)
- [Preview Data v0.3](/schemas/preview-data.v0.3.schema.json)
- [Preview Data v0.2](/schemas/preview-data.v0.2.schema.json)
- [Preview Data v0.1](/schemas/preview-data.v0.1.schema.json)

Stable aliases:

- [Theme Manifest (stable alias)](/schemas/theme.schema.json)
- [Preview Data (stable alias)](/schemas/preview-data.schema.json)

## Notes

- When a new version is released, aliases can be updated without changing client URLs.
- `theme runtime v0.3` adds optional `theme.json.menuSlots` declarations for theme-defined menu locations.
- `preview-data v0.5` keeps the site-level comment policy and post-level `allow_comments`.
- `preview-data v0.5` moves post/page bodies to raw `content` plus `document_type` and normalizes authors into `content.authors[]`.
- `preview-data v0.5` keeps `post.id`, but pages/categories/tags do not carry internal ids.
