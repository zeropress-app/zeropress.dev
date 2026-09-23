---
description: Customize a starter's theme, preview changes locally, and validate the result.
---

# Customize a Theme

Each [starter](../../getting-started/index.md) includes a `theme/` directory.
Edit its templates and styles to change your site's appearance.

## Preview Your Changes

In your starter repository, install dependencies and start the local preview:

```bash
npm ci
npm run dev
```

Open the local URL printed in the terminal. Keep the preview running while you
edit `theme/`; changes appear in the browser.

## Choose What To Edit

| Change | File |
| --- | --- |
| Colors, spacing, typography | `theme/assets/style.css` |
| Shared page shell | `theme/layout.html` |
| Header, footer, or reusable cards | Files in `theme/partials/` |
| Home page and post lists | `theme/index.html` |
| Individual posts | `theme/post.html` |
| Individual pages | `theme/page.html` |
| Theme identity and supported features | `theme/theme.json` |

For example, add a site description to `theme/partials/header.html`:

```html
{{#if site.description}}
  <p class="site-tagline">{{site.description}}</p>
{{/if}}
```

Then style it in `theme/assets/style.css`:

```css
.site-tagline {
  max-width: 42ch;
  margin-block: 0.5rem;
  font-size: 0.95rem;
}
```

Set the description through your site's content source: Studio settings, the
Markdown starter's `documents/.zeropress/config.json`, or the WordPress export
used by the WXR starter. Template variables read the resulting Preview Data.

## Keep Site Files Separate

Put reusable templates, CSS, JavaScript, and small decorative assets in `theme/`.
Put site-specific images and downloads in `public/`, or use your media host.
For example, `public/downloads/guide.pdf` is published at `/downloads/guide.pdf`.

Edit the source files, not generated build output. See
[Theme Package Limits](../../reference/theme-runtime/package-limits/index.md)
when adding assets or distributing a theme.

## Validate And Build

Check the theme, then build it with your site's content:

```bash
npx @zeropress/theme validate ./theme
npm run build
```

The validator checks the theme package. The build also checks its content and
renders the complete site. Commit the source changes to your starter repository
to use them in its next deployment.

## Port An Existing Site

Start with the [official Minimal example](https://github.com/zeropress-app/zeropress-create-theme/tree/main/src/templates/minimal), which includes a complete theme and matching Preview Data:

```bash
npx @zeropress/create-theme --name my-theme --template minimal
cd my-theme
npx @zeropress/theme dev ./theme --data ./preview-data.json
```

1. Move the site's shared HTML shell into `theme/layout.html` and reusable components into `theme/partials/`. Convert JSX to HTML and template helpers; ZeroPress does not execute React components or client-side routes.
2. Put page and post content in `preview-data.json`, using `meta` for scalar layout choices and `data` for structured sections. Supply menus and collections there, then render their resolved values through the [template contexts](../../reference/theme-runtime/specs/v0.7/index.md#55-common-render-context).
3. Move reusable CSS and browser JavaScript into `theme/assets/`. Keep site media and downloads in `public/` or on a media host. Use generated document URLs for internal links so configured permalinks remain valid.
4. Keep document content in build-rendered HTML. Convert interactive controls to optional browser enhancements; forms, authentication, and other server behavior still need a service.

Validate and build the result with the generated data:

```bash
npx @zeropress/theme validate ./theme
npx @zeropress/build ./theme --data ./preview-data.json --out ./dist
```

When the port is ready, use the theme in the starter matching your content source.
The [Templates and Data guide](templates-and-data/index.md#page-layout-variants)
shows how to preserve different page designs without creating per-page templates.

## Continue Customizing

- [Templates and Data](templates-and-data/index.md): render content, reuse partials, and add page layouts.
- [Navigation and Collections](navigation-and-collections/index.md): menus, post pagination, and reading order.
- [Media and Integrations](media-and-integrations/index.md): images, Markdown styling, search, and interactive features.

To create a separate reusable theme, see [Create a Theme](../cli/index.md#create-a-theme).
For exact manifest and template rules, use the [Theme Runtime Reference](../../reference/theme-runtime/index.md).
