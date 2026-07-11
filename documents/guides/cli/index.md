# ZeroPress CLI Tools

ZeroPress provides a small set of command line tools for creating themes, validating theme directories, previewing local work, and building static site output.

These tools support the Preview Data v0.7 publishing workflow and Theme Runtime v0.7. They are not runtime contracts themselves, but they are the recommended way to work with those contracts.

## Choose The Tool

| Goal | Tool |
| --- | --- |
| Create a starter theme and fixture preview-data | `@zeropress/create-theme` |
| Preview or validate a theme | `@zeropress/theme` |
| Build directly from `preview-data.json` and `theme/` | `@zeropress/build` |
| Build a Markdown source tree for static hosting | `@zeropress/build-pages` |

## Markdown Sites

Use `@zeropress/build-pages` when a repository contains Markdown files, public assets, and optional `.zeropress/config.json`. Build Pages is documented separately at [build-pages.zeropress.dev](https://build-pages.zeropress.dev/).

An authored config file uses the strict [Build Pages Config v1.0 Schema](https://schemas.zeropress.dev/build-pages-config/v1.0/schema.json) and must declare `"version": "1.0"`. If the default config path does not exist, Build Pages continues with its documented defaults; a missing path supplied explicitly with `--config` is an error. The resolved config always records the v1.0 schema URL and `version: "1.0"`.

Earlier config versions and historical `site.indexing` are rejected without a compatibility fallback.

Build Pages validates source-relative file paths against controls, backslashes, traversal, and empty/dot segments. Menu URLs use the Preview Data navigation policy: safe single-slash root-relative or credential-free HTTP(S) only. Omitted `menus` materializes a `primary` menu containing Home, while an explicit `{}` opts out. An omitted menu `name` uses its menu id, and an omitted collection `title` uses its collection id. These deterministic fallbacks are recorded in the resolved config before Preview Data is generated.

## Theme Development

Create a starter theme:

```bash
npx @zeropress/create-theme --name my-docs-theme --template docs
```

Preview the generated theme:

```bash
npx @zeropress/theme dev ./my-docs-theme/theme --data ./my-docs-theme/preview-data.json
```

Validate the theme:

```bash
npx @zeropress/theme validate ./my-docs-theme/theme
```

Theme validation uses fixed hard limits: 4 MiB in total, 1 MiB per file, and 128 entries. The final theme input entry and entries inside the package cannot be symbolic links. Ancestor aliases are allowed for read inputs, and accepted roots are pinned to canonical paths before use. Literal backslashes are invalid package path characters, and NFC/case-normalized path collisions are rejected. The same size, path-identity, and canonical-root policies apply when Build Core loads a theme directory. See [Theme Package Limits](../../reference/theme-runtime/package-limits/index.md) for the complete policy.

Human-readable Theme CLI diagnostics render attacker-controlled control, escape, line, and Unicode direction characters as visible `\uXXXX` sequences; `validate --json` retains its machine-readable data contract.

Theme dev uses one recursive watcher for each real theme and public root. Hidden theme asset directories remain observable, while the public-root watcher ignores hidden entries, `node_modules`, keys, PEM files, and other private public entries. Decoded request paths containing backslashes or controls are rejected before lookup. Runtime deletion, recreation, and transient or immediately asynchronous watcher errors are recovered with capped retries; optional public-root recovery does not block theme rebuilds, a root recreated as a symbolic link is rejected, and a public directory absent at startup still requires a restart before it is introduced. Live reload is appended after authored HTML so body-like text in scripts or examples is not rewritten. IPv6 bind addresses are printed as bracketed browser URLs.

The old unscoped `create-zeropress-theme` package is deprecated. Use `@zeropress/create-theme` for new projects.

## Direct Preview Data Builds

Use `@zeropress/build` when you already have a v0.7 `preview-data.json` file and a ZeroPress theme:

```bash
npx @zeropress/build ./theme --data ./preview-data.json --out ./dist
```

This path is useful for AI-generated sites, admin-generated preview-data, importers, and custom pipelines.

## Package References

For copy-paste command snippets, see [Package Quick Starts](../../packages/index.md).

The package READMEs are the source of truth for command options and release metadata:

- [`@zeropress/build-pages`](https://build-pages.zeropress.dev/)
- [`@zeropress/create-theme`](https://www.npmjs.com/package/@zeropress/create-theme)
- [`@zeropress/theme`](https://www.npmjs.com/package/@zeropress/theme)
- [`@zeropress/build`](https://www.npmjs.com/package/@zeropress/build)

## Related Contracts

- [Theme Runtime Reference](../../reference/theme-runtime/index.md)
- [Preview Data Reference](../../reference/preview-data/index.md)
- [Theme Manifest Runtime v0.7 Schema](https://schemas.zeropress.dev/theme-runtime/v0.7/schema.json)
- [Preview Data v0.7 Schema](https://schemas.zeropress.dev/preview-data/v0.7/schema.json)
- [Build Pages Config v1.0 Schema](https://schemas.zeropress.dev/build-pages-config/v1.0/schema.json)
