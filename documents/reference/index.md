# ZeroPress Reference

This is the reference hub for the current ZeroPress v0.6 contracts. Start here when validating generated output, reviewing a theme manifest, or checking contract behavior.

For workflow guidance, use [Getting Started](../getting-started/index.md) first. Markdown-source Build Pages documentation lives at [build-pages.zeropress.dev](https://build-pages.zeropress.dev/).

## Current Contract References

- [Preview Data Reference](preview-data/index.md)
- [Theme Runtime Reference](theme-runtime/index.md)
- [Static Search](../static-search/index.md)

## Archived Contract Pages

The immediately previous public contract remains available for direct review. These pages are delisted from automatic discovery outputs, but linked here for compatibility checks:

- [Preview Data Spec v0.5](../spec/preview-data-v0.5.md)
- [Theme Runtime Spec v0.5](../spec/theme-runtime-v0.5.md)

## Notes

- New projects should target preview-data `version: "0.6"` and theme `runtime: "0.6"`.
- `preview-data v0.6` uses snake_case site keys such as `media_base_url`, `media_delivery_mode`, `posts_per_page`, `datetime_display`, `date_style`, `time_style`, and `disallow_comments`.
- `theme runtime v0.6` uses snake_case manifest keys such as `menu_slots`, `widget_areas`, `site_meta`, `collection_slots`, and `features.post_index`.
- `site.footer.attribution` is a boolean in v0.6. ZeroPress does not add a copyright symbol automatically.
- Machine-readable JSON Schema files live at [schemas.zeropress.dev](https://schemas.zeropress.dev/).
