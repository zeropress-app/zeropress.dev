# ZeroPress Theme Runtime Spec v0.1

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

## 2. Runtime Contract (Current)

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
- `assets/style.css` is effectively required.
- `assets/theme.js` is optional and is not auto-executed by the runtime contract.
- Upload ZIPs may be root-flat or wrapped in one top-level folder (`basePrefix`).

## 2.1 Optional Devtools Layer

Using `create-zeropress-theme --with-devtools` may add local development files (for example, `package.json`) to the theme directory.

Important:

- This is a local convenience layer and does not change the runtime contract.
- Final upload ZIP validation is based on pure theme files.
- `node_modules` and lockfiles are excluded from packaging.
- Devtools scripts are thin wrappers around `zeropress-theme` commands (no extra local dependencies required by default).

## 3. `theme.json` (Current)

Minimal example:

```json
{
  "name": "my-theme",
  "version": "0.1.0",
  "author": "Author Name",
  "description": "Theme description"
}
```

Required fields:

- `name` (string)
- `version` (semver)
- `author` (string)

Recommended field:

- `description` (string)

## 4. Template Rules

- `layout.html` must include exactly one `{{slot:content}}`.
- Allowed slot names: `content`, `header`, `footer`, `meta`.
- Nested slot expressions are not allowed.
- `<script>` tags are not allowed in `layout.html`.
- Mustache block syntax is not allowed (`{{#...}}`, `{{/...}}`).

## 5. Variables and Rendering

- Only simple variable substitution is supported.
- Rendering is designed for server-prepared data injection.
- JavaScript is for progressive enhancement, not core rendering.
- Runtime data may include richer HTML-ready fields on post objects.
- `{{post.comments_html}}` is supported as an optional rendered HTML fragment for post comment sections.

## 6. Security and Packaging Rules

- Tooling does not execute theme code.
- Path escape is forbidden (for example, `../` or absolute path traversal).
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
- Invalid `version` semver
- `layout.html` slot rule violations
- Disallowed template syntax patterns (for example, `{{#...}}`, `{{/...}}`)

Warnings:

- Missing optional templates: `archive.html`, `category.html`, `tag.html`
- `post.html` missing `{{post.comments_html}}` (recommended comments placeholder)
- `{{post.comments_html}}` used outside `post.html`

## 8. CLI Alignment

`npx zeropress-theme validate`, `pack`, and `dev` use this runtime contract as the baseline.

## 9. Compatibility Notes

- `pack` generates root-flat ZIP output by default.
- Upload validation also accepts a single-folder wrapped root for user convenience.

## 10. Toolkit Baseline

- Node.js: `>= 18.18.0`
- ESM only
- CommonJS is not supported
- No compatibility polyfills for lower Node versions

Initial package versions:

- `create-zeropress-theme@0.1.0`
- `zeropress-theme@0.1.0`

## 11. Normative vs Informative Summary

| Item | Classification | Notes |
| --- | --- | --- |
| `theme.json`, `layout.html`, `index.html`, `post.html`, `page.html`, `assets/style.css` | Normative (Required) | Missing files produce validation errors |
| `theme.json.name`, `theme.json.version`, `theme.json.author` | Normative (Required) | Must be non-empty strings; `version` must be semver |
| `layout.html` must contain exactly one `{{slot:content}}` | Normative (Required) | Validation error if violated |
| Allowed slots: `content`, `header`, `footer`, `meta` | Normative (Required) | Unknown slots are invalid |
| No `<script>` in `layout.html` | Normative (Required) | Validation error in standard checks |
| Mustache block syntax forbidden (`{{#...}}`, `{{/...}}`) | Normative (Required) | Validation error |
| Path/symlink root escape forbidden | Normative (Required) | Validation error |
| `archive.html`, `category.html`, `tag.html` | Informative (Recommended) | Missing files produce warnings, not errors |
| `theme.json.description` | Informative (Recommended) | Recommended metadata for better theme clarity |
| `post.comments_html` variable | Informative (Optional) | Optional post-level rendered HTML fragment for comments |
| `partials/` directory | Informative (Optional) | Supported but not required by runtime contract |
| `assets/theme.js` | Informative (Optional) | Optional file; not auto-executed by runtime contract |
| Devtools files (`package.json`, scripts, lockfiles) | Informative (Local tooling layer) | Useful for local workflows; excluded from packaging |
