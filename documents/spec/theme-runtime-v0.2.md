# ZeroPress Theme Runtime Spec v0.2

> Status: Superseded by v0.3
>
> This document is kept for historical reference only.
> New validation, upload, and submission flows must use v0.3:
> [Theme Runtime v0.3](/spec/theme-runtime-v0.3.md)

## 0. Core Philosophy

- Themes define structure, not application behavior.
- A theme bundle is a file-only artifact.
- Tooling (`dev`, `validate`, `pack`) is external to the runtime contract.
- Themes must render meaningful HTML even without JavaScript.

## 1. Scope

A ZeroPress theme is responsible only for:

- HTML templates
- CSS and static assets
- Theme metadata (`theme.json`)

Out of scope:

- Backend APIs, authentication, and admin features
- Client-side routing-dependent app architecture
- Runtime logic-centric application behavior

## 2. Runtime Contract

Baseline structure compatible with current build/upload pipelines:

```txt
my-theme/
  theme.json
  layout.html
  index.html
  post.html
  page.html
  archive.html
  category.html
  tag.html
  404.html (optional)
  partials/
    *.html
  assets/
    style.css
    theme.js (optional)
```

Key points:

- Template files are expected as root-level `.html` files.
- `partials/` is optional.
- `assets/style.css` is required.
- `assets/theme.js` is optional and is not auto-executed by the runtime contract.
- `archive.html`, `category.html`, and `tag.html` are optional capabilities. If a theme omits them, related route outputs are omitted even when preview-data still contains those route arrays.
- `404.html` is optional. When present, build tooling may emit a `404.html` artifact; when absent, that artifact is omitted.
- Upload ZIPs may be root-flat or wrapped in one top-level folder.

## 3. `theme.json` v0.2

Minimal example:

```json
{
  "name": "My Theme",
  "namespace": "your-namespace",
  "slug": "my-theme",
  "version": "0.2.0",
  "license": "MIT",
  "description": "A ZeroPress theme.",
  "runtime": "0.2"
}
```

Required fields:

- `name` (string, 1-80 chars)
- `namespace` (string, 3-24 chars)
- `slug` (string, 3-32 chars)
- `version` (semver)
- `license` (enum)
- `runtime` (must be `"0.2"`)

Optional fields:

- `author` (string, 1-80 chars if present)
- `description` (string, up to 280 chars)

License enum:

- `MIT`
- `Apache-2.0`
- `BSD-3-Clause`
- `GPL-3.0-only`
- `GPL-3.0-or-later`

Identity rules:

- `namespace` and `slug` must follow the ZeroPress package naming rules
- `namespace` must match the registered publisher namespace in directory-backed submission flows
- `slug` is the canonical theme identifier within a namespace

## 4. Template Rules

- `layout.html` must include exactly one `{{slot:content}}`.
- Allowed slot names: `content`, `header`, `footer`, `meta`.
- Nested slot expressions are not allowed.
- `<script>` tags are not allowed in `layout.html`.
- Mustache block syntax is not allowed (`{{#...}}`, `{{/...}}`).

## 5. Variables and Rendering

- Only simple variable substitution is supported.
- Rendering is designed for build-generated data injection.
- JavaScript is for progressive enhancement, not core rendering.
- Preview-data stays canonical and data-only; build tooling computes theme-facing render data immediately before template rendering.
- Runtime data may include richer HTML-ready fields on post objects.
- `{{post.comments_html}}` is supported as an optional rendered HTML fragment for post comment sections.

## 6. Security and Packaging Rules

- Tooling does not execute theme code.
- Path escape is forbidden.
- Symlink-based root escape is forbidden.
- Distribution unit is a ZIP archive.

Commonly excluded files:

- `.git`
- `node_modules`
- `dist`
- `*.log`
- `__MACOSX`, `.DS_Store`
- `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`

## 7. Validation Profile

Errors:

- Missing `theme.json` or invalid JSON
- Missing required templates (`layout.html`, `index.html`, `post.html`, `page.html`)
- Missing `assets/style.css`
- Missing required manifest fields
- Invalid `version` semver
- Invalid `license`
- `runtime` not equal to `"0.2"`
- Invalid `namespace` or `slug`
- `layout.html` slot rule violations
- Disallowed template syntax patterns

Warnings:

- Missing optional templates: `archive.html`, `category.html`, `tag.html`
- `post.html` missing `{{post.comments_html}}`
- `{{post.comments_html}}` used outside `post.html`

Runtime behavior:

- Required preview-data route arrays do not guarantee emitted artifacts for optional route kinds.
- `archive`, `category`, and `tag` pages are emitted only when both renderable route data exists and the matching template exists.
- `404.html` is emitted only when the theme provides a `404.html` template.

## 8. CLI Alignment

`npx zeropress-theme validate`, `pack`, and `dev` use this runtime contract as the baseline.

## 9. Compatibility Notes

- `v0.2` is kept for historical reference only.
- New validation and upload flows must use `v0.3`.

## 10. Toolkit Baseline

- Node.js: `>= 18.18.0`
- ESM only
- CommonJS is not supported

## 11. Normative vs Informative Summary

| Item | Classification | Notes |
| --- | --- | --- |
| `theme.json`, `layout.html`, `index.html`, `post.html`, `page.html`, `assets/style.css` | Normative (Required) | Missing files produce validation errors |
| `theme.json.name`, `theme.json.namespace`, `theme.json.slug`, `theme.json.version`, `theme.json.license`, `theme.json.runtime` | Normative (Required) | Must be present and valid |
| `theme.json.author` | Informative (Optional) | Optional package display metadata |
| `theme.json.description` | Informative (Optional) | Recommended metadata for theme clarity |
| `layout.html` must contain exactly one `{{slot:content}}` | Normative (Required) | Validation error if violated |
| Allowed slots: `content`, `header`, `footer`, `meta` | Normative (Required) | Unknown slots are invalid |
| No `<script>` in `layout.html` | Normative (Required) | Validation error |
| Mustache block syntax forbidden (`{{#...}}`, `{{/...}}`) | Normative (Required) | Validation error |
| Path/symlink root escape forbidden | Normative (Required) | Validation error |
| `archive.html`, `category.html`, `tag.html` | Informative (Recommended) | Missing files produce warnings |
| `partials/` directory | Informative (Optional) | Supported but not required |
| `assets/theme.js` | Informative (Optional) | Optional file; not auto-executed |
