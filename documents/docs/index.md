# ZeroPress Public Docs

This site publishes public ZeroPress theme authoring guides, runtime documentation, CLI guides, and JSON schemas.

Current contract highlights:

- Theme runtime current spec: `v0.5`
- Preview-data current schema: `v0.5`

## Theme Authoring

- [Theme Authoring Guide](/theme-authoring/index.md)

## Theme Runtime Spec

- [Theme Runtime v0.5](/spec/theme-runtime-v0.5.md)

## Preview Data Spec

- [Preview Data v0.5](/spec/preview-data-v0.5.md)

## CLI Tools

- [CLI Tools Overview](/cli/index.md)

## Build Pages Config

- [ZeroPress Build Pages Config](/build-pages-config/index.md)

## JSON Schemas

Current v0.5 schemas:

- [Theme Manifest Runtime v0.5](/schemas/theme.v0.5.runtime.schema.json)
- [Preview Data v0.5](/schemas/preview-data.v0.5.schema.json)
- [ZeroPress Build Pages Config v0.1](/schemas/zeropress-build-pages.config.v0.1.schema.json)

Historical preview-data schemas:

- [Preview Data v0.4](/schemas/preview-data.v0.4.schema.json)
- [Preview Data v0.3](/schemas/preview-data.v0.3.schema.json)
- [Preview Data v0.2](/schemas/preview-data.v0.2.schema.json)
- [Preview Data v0.1](/schemas/preview-data.v0.1.schema.json)

## Notes

- Schema documents are published as versioned historical files.
- `theme runtime v0.5` adds loop metadata, pagination windows, partial arguments, and branch-reduction tags on top of the structured `v0.4` contract.
- `preview-data v0.5` keeps the site-level comment policy and post-level `allow_comments`.
- `preview-data v0.5` moves post/page bodies to raw `content` plus `document_type` and normalizes authors into `content.authors[]`.
- `preview-data v0.5` keeps `post.id`, but pages/categories/tags do not carry internal ids.
