# Package Quick Starts

This page shows the shortest useful command for each public ZeroPress package.

For complete options and release notes, use each package README.

## `@zeropress/build-pages`

Build a Markdown source tree into static output. Build Pages has its own product documentation:

- [Build Pages Documentation](https://build-pages.zeropress.dev/)
- [GitHub Marketplace Action](https://github.com/marketplace/actions/build-zeropress-pages)

## `@zeropress/create-theme`

Create a starter theme and fixture preview-data:

```bash
npx @zeropress/create-theme --name my-theme --template docs
```

Templates:

- `minimal`
- `blog`
- `docs`
- `portfolio`
- `magazine`

## `@zeropress/theme`

Preview a theme:

```bash
npx @zeropress/theme dev ./my-theme/theme --data ./my-theme/preview-data.json
```

Validate a theme:

```bash
npx @zeropress/theme validate ./my-theme/theme
```

Theme directories must satisfy the fixed [Theme Package Limits](../reference/theme-runtime/package-limits/index.md).

## `@zeropress/build`

Build directly from a theme and preview-data:

```bash
npx @zeropress/build ./theme --data ./preview-data.json --out ./dist
```

## Validators

Most users reach validators through `@zeropress/build`, `@zeropress/theme`, or `@zeropress/build-pages`.

Direct packages:

- `@zeropress/preview-data-validator`
- `@zeropress/theme-validator`

Use the current schemas when reviewing generated files:

- [Preview Data v0.7 Schema](https://schemas.zeropress.dev/preview-data/v0.7/schema.json)
- [Theme Manifest Runtime v0.7 Schema](https://schemas.zeropress.dev/theme-runtime/v0.7/schema.json)
