# ZeroPress Public Docs

This site publishes public ZeroPress theme authoring guides, runtime documentation, CLI guides, and JSON schemas.

Current contract highlights:

- Theme runtime current spec: `v0.6`
- Preview-data current schema: `v0.6`

## Theme Authoring

- [Theme Authoring Guide](/theme-authoring/index.md)

## Theme Runtime Spec

- [Theme Runtime v0.6](/spec/theme-runtime-v0.6.md)

## Preview Data Spec

- [Preview Data v0.6](/spec/preview-data-v0.6.md)

## CLI Tools

- [CLI Tools Overview](/cli/index.md)

## Build Pages Config

- [ZeroPress Build Pages Config](/build-pages-config/index.md)

## Static Search

- [Static Search](/static-search/index.md)

## Licensing

- [ZeroPress Licensing](/license/index.md)

## JSON Schemas

Current v0.6 schemas:

- [Theme Manifest Runtime v0.6](/schemas/theme.v0.6.runtime.schema.json)
- [Preview Data v0.6](/schemas/preview-data.v0.6.schema.json)
- [ZeroPress Build Pages Config v0.1](/schemas/zeropress-build-pages.config.v0.1.schema.json)

Historical preview-data schemas:

- [Preview Data v0.5](/schemas/preview-data.v0.5.schema.json)
- [Preview Data v0.4](/schemas/preview-data.v0.4.schema.json)
- [Preview Data v0.3](/schemas/preview-data.v0.3.schema.json)
- [Preview Data v0.2](/schemas/preview-data.v0.2.schema.json)
- [Preview Data v0.1](/schemas/preview-data.v0.1.schema.json)

Historical theme runtime schemas:

- [Theme Manifest Runtime v0.5](/schemas/theme.v0.5.runtime.schema.json)
- [Theme Manifest Runtime v0.4](/schemas/theme.v0.4.runtime.schema.json)
- [Theme Manifest Runtime v0.3](/schemas/theme.v0.3.runtime.schema.json)
- [Theme Manifest Runtime v0.2](/schemas/theme.v0.2.runtime.schema.json)
- [Theme Manifest Runtime v0.1](/schemas/theme.v0.1.runtime.schema.json)

## Notes

- Schema documents are published as versioned historical files.
- `theme runtime v0.6` uses snake_case manifest keys such as `menu_slots`, `widget_areas`, `site_meta`, `collection_slots`, and `features.post_index`.
- `preview-data v0.6` uses snake_case site keys such as `media_base_url`, `media_delivery_mode`, `posts_per_page`, `datetime_display`, `date_style`, `time_style`, and `disallow_comments`.
- `site.footer.attribution` is a boolean in v0.6. ZeroPress still does not add a copyright symbol automatically.
- `preview-data v0.6` keeps post/page bodies as raw `content` plus `document_type`, and named collections remain optional theme-facing data.
