# ZeroPress Build Pages Config

ZeroPress Build Pages config is the site-local configuration format used by `@zeropress/build-pages` GitHub Pages style Markdown workflows.

It is not the same thing as preview-data or a theme manifest. The config file is read before `@zeropress/build` runs, then converted into internal preview-data.

This page is a public mirror for the active schema and the options used by this docs site. The `@zeropress/build-pages` package README and schemas are the canonical source of truth for CLI and GitHub Action behavior.

## File Location

Place the config file inside the configured source root:

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

For `@zeropress/build-pages`, the source root is controlled by the GitHub Action `source` input or CLI `--source`. The GitHub Action defaults to `./docs`; CLI usage requires an explicit `--source`.

`zeropress.dev` uses:

```bash
zeropress-build-pages --source documents --destination _site
```

Use a dedicated source directory such as `docs/` or `documents/`. Repository root source (`--source ./`) is not supported.

The `.zeropress/` directory is for Build Pages-only source files. It is not copied to the final output as public passthrough content.

## Schema

Use the versioned schema while editing config:

```json
{
  "$schema": "https://zeropress.dev/schemas/zeropress-build-pages.config.v0.1.schema.json",
  "version": "0.1"
}
```

Schema URLs:

- [ZeroPress Build Pages Config v0.1](/schemas/zeropress-build-pages.config.v0.1.schema.json)

The version string belongs to the build-pages config format. It does not change the internal preview-data version emitted by Build Pages.

## Minimal Config

```json
{
  "$schema": "https://zeropress.dev/schemas/zeropress-build-pages.config.v0.1.schema.json",
  "version": "0.1",
  "site": {
    "title": "My Docs",
    "description": "Documentation for my project.",
    "url": "https://example.com",
    "expose_generator": true,
    "indexing": true,
    "footer": {
      "copyright_text": "Copyright 2026 Example Corp.",
      "attribution": true
    }
  },
  "front_page": {
    "type": "markdown"
  }
}
```

With this config, Build Pages reads `index.md`, emits it as the front page, and disables the post index because this workflow is Markdown-docs oriented.

## Site Metadata

`site` provides user-facing site metadata:

```json
{
  "site": {
    "title": "My Docs",
    "description": "Documentation for my project.",
    "url": "https://example.com",
    "expose_generator": true,
    "indexing": true
  }
}
```

Common fields:

- `title`
- `description`
- `url`
- `expose_generator`
- `indexing`
- `footer`

Renderer-only preview-data fields such as locale, date/time formats, permalink policy, comments policy, and posts-per-page are not accepted in Build Pages config. Build Pages supplies those internal defaults while generating preview-data.

`site.expose_generator` controls the HTML generator meta tag. Missing or `true` emits `<meta name="generator" content="ZeroPress">`; set it to `false` for white-label sites.

`site.indexing` controls only the generated fallback `robots.txt`. Missing or `true` allows indexing; `false` writes a fallback `robots.txt` that disallows all agents. If the source directory contains `robots.txt`, that file is copied as-is and takes priority over `site.indexing`. ZeroPress does not append a `Sitemap` directive to a source-provided `robots.txt`; add `Sitemap: https://example.com/sitemap.xml` manually when needed.

A root-level source `sitemap.xsl` is copied as a public passthrough file. When ZeroPress generates `sitemap.xml`, it auto-discovers that file and adds an XML stylesheet processing instruction for `/sitemap.xsl`.

## Footer

`site.footer` provides theme-facing footer text and attribution display policy:

```json
{
  "site": {
    "footer": {
      "copyright_text": "Copyright 2026 Example Corp.",
      "attribution": false
    }
  }
}
```

The bundled docs theme renders `copyright_text` when present. If it is omitted, the theme falls back to `site.title`. ZeroPress does not add a copyright symbol automatically.

The bundled docs theme shows `Published with ZeroPress.` by default. Set `site.footer.attribution` to `false` to hide it.

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

Build Pages reads those files and emits internal preview-data:

```json
{
  "custom_html": {
    "head_end": {
      "content": "<meta name=\"theme-color\" content=\"#ffffff\">"
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

## Markdown Source Copy

Build Pages copies original Markdown files to the generated output by default. The bundled docs theme uses this to show `View this page as Markdown` links.

This is a CLI and GitHub Action option, not a config field:

```bash
zeropress-build-pages --source docs --destination _site --no-copy-markdown-source
```

```yaml
with:
  copy-markdown-source: false
```

When disabled, `.md` files are not copied as public passthrough files and generated pages do not receive `page.meta.source_markdown_url`.

## Internal `.zeropress/` Files

Build Pages writes internal working files to `.zeropress/` in the current working directory. These files are not the final deploy output.

```txt
.zeropress/
  build-pages-config.json
  preview-data.json
  build-report.json
  public-assets/
```

`build-pages-config.json` records the resolved user-facing Build Pages config for the current run.

`preview-data.json` is the internal generated build input passed to the ZeroPress renderer.

`build-report.json` records discovered Markdown counts, skipped Markdown files, front page resolution, source Markdown copy policy, and custom HTML slots. It is useful when testing larger documentation corpora. `public-assets/` is a temporary staged public root used before `@zeropress/build` writes generated output.

## Failure Policy

Build Pages fails when:

- `config.json` is malformed JSON.
- `front_page.file` points outside the source root.
- `front_page.type: "html"` points outside `.zeropress/`.
- A referenced `.zeropress/*.html` file is missing or empty.
- Markdown selected as a page has no title, unless `--skip-untitled-markdown` or the GitHub Action `skip-untitled-markdown` input is used.

If `config.json` is missing, Build Pages falls back to defaults. This keeps the workflow usable for simple Markdown directories.

## Related Docs

- [CLI Tools](../cli/index.md)
- [Preview Data v0.6](../spec/preview-data-v0.6.md)
- [Theme Runtime v0.6](../spec/theme-runtime-v0.6.md)
