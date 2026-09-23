---
description: Create and preview ZeroPress themes, import WordPress exports, and build static sites from the command line.
---

# ZeroPress CLI Tools

Use these commands when creating a theme or building a site outside a starter
repository. For a ready-to-deploy site, see [Getting Started](../../getting-started/index.md).

## Choose A Tool

| Task | Package |
| --- | --- |
| Create a theme and sample content | [`@zeropress/create-theme`](https://github.com/zeropress-app/zeropress-create-theme) |
| Preview or validate a theme | [`@zeropress/theme`](https://github.com/zeropress-app/zeropress-theme) |
| Build from Preview Data and a theme | [`@zeropress/build`](https://github.com/zeropress-app/zeropress-build) |
| Build from Markdown | [`@zeropress/build-pages`](https://build-pages.zeropress.dev/) |
| Convert a WordPress WXR export to Preview Data | [`@zeropress/wxr-import`](https://github.com/zeropress-app/zeropress-wxr-import) |

Each package README lists its requirements and full command options.

## Create A Theme

```bash
npx @zeropress/create-theme --name my-theme --template docs
```

Choose `minimal`, `blog`, `docs`, `portfolio`, or `magazine`. The generated project
includes `theme/` and sample `preview-data.json`.

## Preview And Validate

Preview the generated theme locally:

```bash
npx @zeropress/theme dev ./my-theme/theme --data ./my-theme/preview-data.json
```

Validate it:

```bash
npx @zeropress/theme validate ./my-theme/theme
```

See [Theme Authoring](../theme-authoring/index.md) for templates and customization,
and [Theme Package Limits](../../reference/theme-runtime/package-limits/index.md)
for file and size requirements.

## Build From Preview Data

When you already have a theme and a Preview Data file:

```bash
npx @zeropress/build ./theme --data ./preview-data.json --out ./dist
```

Serve `dist/` with a static host. See the
[Preview Data Reference](../../reference/preview-data/index.md) when generating
your own data.

## Build From Markdown

For Markdown commands, configuration, and GitHub Action usage, follow the
[Build Pages guide](https://build-pages.zeropress.dev/getting-started/).

## Convert A WordPress Export

```bash
npx @zeropress/wxr-import --input ./wordpress-export.xml --output ./preview-data.json
```

Build the resulting file with `@zeropress/build` and a theme. For a ready-made
site that keeps WordPress media and comments, use
[WXR Starter](https://github.com/zeropress-app/zeropress-starter-wxr).

## Validators

The build and theme commands validate their inputs. Custom integrations can use
[`@zeropress/preview-data-validator`](https://github.com/zeropress-app/zeropress-preview-data-validator)
and [`@zeropress/theme-validator`](https://github.com/zeropress-app/zeropress-theme-validator)
directly. The [Reference](../../reference/index.md) documents their contracts.
