# ZeroPress Build Pages Config

ZeroPress Build Pages config is the site-local configuration format used by `@zeropress/build-pages` GitHub Pages style Markdown workflows.

It is not the same thing as preview-data or a theme manifest. The config file is read before `@zeropress/build` runs, then converted into preview-data v0.5.

This page is a public mirror for the active schema and the options used by this docs site. The `@zeropress/build-pages` package README and schemas are the canonical source of truth for CLI and GitHub Action behavior.

## File Location

Place the config file inside the configured public root:

```txt
my-site/
  documents/
    .zeropress/
      config.json
      head-end.html
      body-end.html
    index.md
    docs/
      index.md
```

For `@zeropress/build-pages`, the source root is controlled by `--source` or `ZEROPRESS_PUBLIC_DIR`. If neither is set, the package uses the current directory.

`zeropress.dev` uses:

```bash
ZEROPRESS_PUBLIC_DIR=documents
```

The `.zeropress/` directory is for prebuild-only source files. It is not copied to the final output as public passthrough content.

## Schema

Use the versioned schema while editing config:

```json
{
  "$schema": "../schemas/zeropress-build-pages.config.v0.1.schema.json",
  "version": "0.1"
}
```

Schema URLs:

- [ZeroPress Build Pages Config v0.1](/schemas/zeropress-build-pages.config.v0.1.schema.json)
- [ZeroPress Build Pages Config stable alias](/schemas/zeropress-build-pages.config.schema.json)

The version string belongs to the build-pages config format. It does not change the preview-data version emitted by prebuild, which is still preview-data v0.5.

## Minimal Config

```json
{
  "$schema": "../schemas/zeropress-build-pages.config.v0.1.schema.json",
  "version": "0.1",
  "site": {
    "title": "My Docs",
    "description": "Documentation for my project.",
    "url": "https://example.com",
    "footer": {
      "copyright_text": "Copyright 2026 Example Corp.",
      "attribution": {
        "enabled": true
      }
    }
  },
  "front_page": {
    "type": "markdown"
  }
}
```

With this config, prebuild reads `index.md`, emits it as the front page, and disables the post index because this workflow is Markdown-docs oriented.

## Site Metadata

`site` provides defaults copied into generated preview-data:

```json
{
  "site": {
    "title": "My Docs",
    "description": "Documentation for my project.",
    "url": "https://example.com",
    "locale": "en-US",
    "timezone": "UTC"
  }
}
```

Common fields:

- `title`
- `description`
- `url`
- `locale`
- `timezone`
- `permalinks`
- `footer`

## Footer

`site.footer` provides theme-facing footer text and attribution display policy:

```json
{
  "site": {
    "footer": {
      "copyright_text": "Copyright 2026 Example Corp.",
      "attribution": {
        "enabled": false
      }
    }
  }
}
```

The bundled docs theme renders `copyright_text` when present. If it is omitted, the theme falls back to `site.title`. ZeroPress does not add a copyright symbol automatically.

The bundled docs theme shows `Published with ZeroPress.` by default. Set `site.footer.attribution.enabled` to `false` to hide it.

The generated preview-data always sets:

```json
{
  "post_index": {
    "enabled": false
  }
}
```

That keeps the workflow focused on Markdown pages rather than blog post lists.

## Front Page

`front_page` decides what owns `/`.

```json
{
  "front_page": {
    "type": "theme_index"
  }
}
```

`theme_index` uses `theme/index.html`.

```json
{
  "front_page": {
    "type": "markdown"
  }
}
```

`markdown` uses `index.md` by default. You may override the file:

```json
{
  "front_page": {
    "type": "markdown",
    "file": "home.md"
  }
}
```

```json
{
  "front_page": {
    "type": "html"
  }
}
```

`html` uses `.zeropress/index.html` by default. HTML front page files must stay inside `.zeropress/`.

By default, HTML front page content is rendered through the ZeroPress page layout:

```json
{
  "front_page": {
    "type": "html",
    "file": ".zeropress/campaign.html",
    "layout": true
  }
}
```

For a full standalone document, disable the ZeroPress layout:

```json
{
  "front_page": {
    "type": "html",
    "file": ".zeropress/campaign.html",
    "layout": false
  }
}
```

Standalone HTML is trusted raw HTML and is written directly to `/index.html`.

## Menus

`menus` are copied into generated preview-data.

```json
{
  "menus": {
    "primary": {
      "name": "Primary Menu",
      "items": [
        { "title": "Home", "url": "/" },
        { "title": "Docs", "url": "/docs/" }
      ]
    }
  }
}
```

Menu items support:

- `title`
- `url`
- `type`
- `target`
- `children`

## Custom HTML

Use `custom_html` when the site needs trusted HTML injected before `</head>` or `</body>` without editing the theme.

```json
{
  "custom_html": {
    "head_end": {
      "file": ".zeropress/head-end.html"
    },
    "body_end": {
      "file": ".zeropress/body-end.html"
    }
  }
}
```

The prebuild step reads those files and emits preview-data:

```json
{
  "custom_html": {
    "head_end": {
      "content": "<meta name=\"generator\" content=\"ZeroPress\">"
    },
    "body_end": {
      "content": "<script defer src=\"/vendor/app.js\"></script>"
    }
  }
}
```

The HTML is trusted raw input. ZeroPress does not sanitize it.

CSS, JavaScript, fonts, images, and third-party packages should remain normal public passthrough files. Load them from `custom_html` with tags such as:

```html
<link rel="stylesheet" href="/vendor/app.css">
<script defer src="/vendor/app.js"></script>
```

## Generated Files

Build Pages writes:

```txt
.zeropress/
  preview-data.json
  prebuild-report.json
  build-pages-public/
```

`preview-data.json` is passed to `@zeropress/build`.

`prebuild-report.json` records discovered Markdown counts, skipped Markdown files, front page resolution, and custom HTML slots. It is useful when testing larger documentation corpora. `build-pages-public/` is a temporary staged public root used before `@zeropress/build` writes generated output.

## Environment Variables

Common environment variables:

| Name | Default | Purpose |
| --- | --- | --- |
| `ZEROPRESS_PUBLIC_DIR` | `.` | Source root for Markdown discovery and public passthrough |
| `ZEROPRESS_THEME_DIR` | bundled `docs` theme | Custom theme directory |
| `ZEROPRESS_OUT_DIR` | `_site` | Output directory used by local scripts |
| `ZEROPRESS_SITE_URL` | config `site.url` | Canonical URL override |
| `ZEROPRESS_SKIP_UNTITLED_MARKDOWN` | `false` | Skip Markdown without an H1 instead of failing prebuild |
| `ZEROPRESS_BUILD_PAGES_CONFIG` | `<source>/.zeropress/config.json` | Config path override |

`zeropress.dev` additionally supports `PRETTIER_FORMAT=false` as a site-local formatting option after Build Pages completes.

## Failure Policy

Prebuild fails when:

- `config.json` is malformed JSON.
- `front_page.file` points outside the public root.
- `front_page.type: "html"` points outside `.zeropress/`.
- A referenced `.zeropress/*.html` file is missing or empty.
- Markdown selected as a page has no top-level heading, unless `ZEROPRESS_SKIP_UNTITLED_MARKDOWN=true`.

If `config.json` is missing, prebuild falls back to defaults. This keeps the workflow usable for simple Markdown directories.

## Related Docs

- [CLI Tools](../cli/index.md)
- [Preview Data v0.5](../spec/preview-data-v0.5.md)
- [Theme Runtime v0.5](../spec/theme-runtime-v0.5.md)
