# ZeroPress CLI Tools

ZeroPress provides a small set of command line tools for creating themes, checking theme packages, previewing local work, building static site output, and turning GitHub Pages style Markdown trees into ZeroPress sites.

These tools support the v0.5 publishing workflow. They are not runtime contracts themselves, but they are the recommended way to work with the v0.5 theme runtime and preview-data contracts.

## Recommended Flow

1. Create a starter theme with `create-zeropress-theme`.
2. Preview, validate, and package the theme with `@zeropress/theme`.
3. Build a static site from a theme and preview-data with `@zeropress/build`.
4. For GitHub Pages style Markdown repositories, use `@zeropress/build-pages` to discover Markdown, generate preview-data, stage public files, and run the build.

## Tools

### `create-zeropress-theme`

Use this when starting a new theme from one of the official starter templates.

- Creates one of the five starter themes: `minimal`, `blog`, `docs`, `portfolio`, or `magazine`.
- Writes a theme directory with v0.5-compatible template files.
- Runs validation after generation.

### `@zeropress/theme`

Use this while developing and preparing a theme package.

- `dev` starts a local preview server.
- `validate` checks a theme directory or packaged zip.
- `pack` creates an upload-ready theme zip.

### `@zeropress/build`

Use this when turning a theme and preview-data into a static site output directory.

- Reads a local theme directory.
- Reads a preview-data v0.5 JSON file.
- Writes static output such as HTML routes, assets, and special files.

### `@zeropress/build-pages`

Use this when a repository is mostly Markdown files and public passthrough assets, similar to a Jekyll Pages source tree.

- Discovers Markdown under a source directory.
- Reads optional `.zeropress/config.json`.
- Preserves original Markdown and public files as passthrough output.
- Generates preview-data v0.5 and delegates the static build to `@zeropress/build`.

## Package References

The npm package pages are the canonical source for command options and package release metadata. Use them for installation commands, badges, and the latest CLI README content.

## Related Contracts

- [ZeroPress Build Pages Config](../build-pages-config/index.md)
- [Theme Runtime v0.5](../spec/theme-runtime-v0.5.md)
- [Preview Data v0.5](../spec/preview-data-v0.5.md)
- [Theme Manifest Runtime v0.5 Schema](/schemas/theme.v0.5.runtime.schema.json)
- [Preview Data v0.5 Schema](/schemas/preview-data.v0.5.schema.json)
