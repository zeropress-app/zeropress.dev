# ZeroPress CLI Tools

ZeroPress provides a small set of command line tools for creating themes, checking theme packages, previewing local work, and building static site output.

These tools support the v0.6 publishing workflow. They are not runtime contracts themselves, but they are the recommended way to work with the v0.6 theme runtime and preview-data contracts.

## Choose The Tool

| Goal | Tool |
| --- | --- |
| Create a starter theme and fixture preview-data | `@zeropress/create-theme` |
| Preview, validate, or package a theme | `@zeropress/theme` |
| Build directly from `preview-data.json` and `theme/` | `@zeropress/build` |
| Build a Markdown source tree for static hosting | `@zeropress/build-pages` |

## Markdown Sites

Use `@zeropress/build-pages` when a repository contains Markdown files, public assets, and optional `.zeropress/config.json`. Build Pages is documented separately at [build-pages.zeropress.dev](https://build-pages.zeropress.dev/).

## Theme Development

Create a starter theme:

```bash
npx @zeropress/create-theme --name my-docs-theme --template docs
```

Preview the generated theme:

```bash
npx @zeropress/theme dev ./my-docs-theme/theme --data ./my-docs-theme/preview-data.json
```

Validate and package the theme:

```bash
npx @zeropress/theme validate ./my-docs-theme/theme
npx @zeropress/theme pack ./my-docs-theme/theme
```

The old unscoped `create-zeropress-theme` package is deprecated. Use `@zeropress/create-theme` for new projects.

## Direct Preview Data Builds

Use `@zeropress/build` when you already have a v0.6 `preview-data.json` file and a ZeroPress theme:

```bash
npx @zeropress/build ./theme --data ./preview-data.json --out ./dist
```

This path is useful for AI-generated sites, admin-generated preview-data, importers, and custom pipelines.

## Package References

For copy-paste command snippets, see [Package Quick Starts](../packages/index.md).

The package READMEs are the source of truth for command options and release metadata:

- [`@zeropress/build-pages`](https://build-pages.zeropress.dev/)
- [`@zeropress/create-theme`](https://www.npmjs.com/package/@zeropress/create-theme)
- [`@zeropress/theme`](https://www.npmjs.com/package/@zeropress/theme)
- [`@zeropress/build`](https://www.npmjs.com/package/@zeropress/build)

## Related Contracts

- [Theme Runtime Reference](../reference/theme-runtime/index.md)
- [Preview Data Reference](../reference/preview-data/index.md)
- [Theme Manifest Runtime v0.6 Schema](https://schemas.zeropress.dev/theme-runtime/v0.6/schema.json)
- [Preview Data v0.6 Schema](https://schemas.zeropress.dev/preview-data/v0.6/schema.json)
