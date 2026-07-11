# ZeroPress Documentation

ZeroPress is a static-first document publishing platform built around reusable themes, explicit build contracts, Markdown-friendly workflows, and CMS-grade authoring.

This site is the public documentation hub for Preview Data v0.7, Theme Runtime v0.7, CLI tools, and theme authoring guidance.

There are three common ways to enter the ZeroPress workflow:

- `@zeropress/build-pages`: turn Markdown source and public files into preview data, then build a static ZeroPress site.
- `@zeropress/build`: build directly from `preview-data.json` and a theme, including data and themes produced by AI-assisted tools.
- ZeroPress Studio: manage content, media, imports, and publishing workflows, then publish preview data that can trigger a ZeroPress build.

## Start With The Workflow

Choose the entry point that matches how you want to build:

- [Getting Started](getting-started/index.md): choose between theme development, direct preview-data builds, and Markdown site publishing.
- [Theme Authoring](guides/theme-authoring/index.md): build reusable v0.7 themes.
- [CLI Tools](guides/cli/index.md): understand how `@zeropress/create-theme`, `@zeropress/theme`, and `@zeropress/build` fit together.
- [Package Quick Starts](packages/index.md): copy the shortest useful command for each public package.

Markdown-source site documentation for `@zeropress/build-pages` now lives at [build-pages.zeropress.dev](https://build-pages.zeropress.dev/).

## Current Reference

New work should target Preview Data `version: "0.7"`, Theme Runtime `runtime: "0.7"`, and Build Pages Config `version: "1.0"`. Historical specs remain available for compatibility review.

- [Reference Hub](reference/index.md)
- [Preview Data Reference](reference/preview-data/index.md)
- [Preview Data Spec v0.7](reference/preview-data/specs/v0.7/index.md)
- [Theme Runtime Reference](reference/theme-runtime/index.md)
- [Static Search](guides/static-search/index.md)
- [Licensing](license/index.md)

Machine-readable JSON Schema files are published separately at [schemas.zeropress.dev](https://schemas.zeropress.dev/).
