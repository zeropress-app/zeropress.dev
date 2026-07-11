# ZeroPress Reference

This is the reference hub for the current ZeroPress contracts. Start here when validating generated output, reviewing a theme manifest, or checking contract behavior.

For workflow guidance, use [Getting Started](../getting-started/index.md) first. Markdown-source Build Pages documentation lives at [build-pages.zeropress.dev](https://build-pages.zeropress.dev/).

## Current Contract References

- [Preview Data Reference](preview-data/index.md)
- [Theme Runtime Reference](theme-runtime/index.md)
- [Theme Package Limits](theme-runtime/package-limits/index.md)
- [Static Search](../guides/static-search/index.md)

## Versioned Specs

- [Preview Data Specs](preview-data/specs/index.md)
- [Theme Runtime Specs](theme-runtime/specs/index.md)

## Historical Contract Pages

Previous contracts remain available for direct review. These pages are delisted from automatic discovery outputs, but linked here for compatibility checks:

- [Preview Data Spec v0.6](preview-data/specs/v0.6/index.md)
- [Preview Data Spec v0.5](preview-data/specs/v0.5/index.md)
- [Theme Runtime Spec v0.6](theme-runtime/specs/v0.6/index.md)
- [Theme Runtime Spec v0.5](theme-runtime/specs/v0.5/index.md)

## Notes

- New projects should target preview-data `version: "0.7"` and theme `runtime: "0.7"`.
- `preview-data v0.7` uses snake_case site keys such as `media_origin`, `media_delivery_mode`, `posts_per_page`, `date_style`, and `time_style`. Optional `search`, `feed`, and `archive` controls use closed `{ "enabled": boolean }` objects, and the global indexing policy is `site.robots: { "allow_indexing": boolean }`. Optional `site.comments` requires `enabled` plus a provider API base; Post/Page ZeroPress request tokens live in the content item's `comments` object. Page front-page and collection references use the effective route path rather than the leaf slug.
- `theme runtime v0.7` uses snake_case manifest keys such as `menu_slots`, `widget_areas`, `site_meta`, `collection_slots`, and `features.post_index`.
- `site.footer.attribution` is a boolean in Preview Data v0.7. ZeroPress does not add a copyright symbol automatically.
- Machine-readable JSON Schema files live at [schemas.zeropress.dev](https://schemas.zeropress.dev/).
