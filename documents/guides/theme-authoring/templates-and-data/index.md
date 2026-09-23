---
description: Render site content with ZeroPress variables, conditions, loops, partials, and page layouts.
---

# Templates and Data

Templates combine HTML with values prepared from Preview Data. Begin with
[Customize a Theme](../index.md) to run a starter's local preview.

## Shared Layout

`layout.html` wraps the route template and must contain exactly one content slot:

```html
<main>
  {{slot:content}}
</main>
```

Shared fragments live in `partials/`. Include one with `{{partial:header}}`, or
use an existing named slot such as `{{slot:header}}`. Put shared scripts in a
partial and include it from the layout; direct `<script>` tags in `layout.html`
are not allowed.

Use the [complete Minimal layout](https://github.com/zeropress-app/zeropress-create-theme/blob/main/src/templates/minimal/theme/layout.html)
as a starting point for the document shell, metadata, and asset links.
`<title>{{meta.title}}</title>` and `{{meta.head_tags}}` render the
[generated head metadata](../../../reference/theme-runtime/specs/v0.7/index.md#head-metadata);
this root `meta` object is separate from authored `site.meta`.

## Variables And Conditions

Use `{{path.to.value}}` to insert a value and `{{#if ...}}` to show optional UI:

```html
<a href="/">{{site.title}}</a>
{{#if site.description}}
  <p>{{site.description}}</p>
{{/if}}
```

Comparison helpers support exact matches and branches:

```html
{{#if_eq route.type "post"}}
  <span>Article</span>
{{#else_if_eq route.type "page"}}
  <span>Page</span>
{{/if}}
```

These are template helpers, not JavaScript expressions. Comparisons preserve
types; `4` and `"4"` are different. See the
[syntax reference](../../../reference/theme-runtime/specs/v0.7/index.md#4-template-syntax)
for the complete helper and loop syntax.

## Route Data

The [render-context reference](../../../reference/theme-runtime/specs/v0.7/index.md#55-common-render-context)
lists the common roots and each route's data. `post.html` receives `post`,
`page.html` receives `page`, and listing templates use summary items rather than
complete detail objects.

Use `route.is_front_page` and `route.is_post_index` where a template serves more
than one purpose. A Page selected as the front page is rendered at `/`; its
usual page route is not emitted.

## Lists And Partials

Render post cards by looping over `posts.items`:

```html
{{#for post in posts.items}}
  {{partial:post-card post=post variant="compact"}}
{{/for}}
```

Create `partials/post-card.html` to use the passed arguments under `partial.*`:

```html
<article class="post-card post-card--{{partial.variant}}">
  <h2><a href="{{partial.post.url}}">{{partial.post.title}}</a></h2>
  {{#if partial.post.summary}}<p>{{partial.post.summary}}</p>{{/if}}
</article>
```

Use `summary` for cards: it contains the authored excerpt or a summary derived
from the body. Use `excerpt` when a detail page should show only the author's
introductory text.

## Post And Page Bodies

`post.html` and `page.html` contain rendered body HTML. For Markdown documents
whose body already includes the title, render it without adding another H1:

```html
<article class="prose">
  {{page.html}}
</article>
```

For content written without a body H1, the template can provide
`<h1>{{page.title}}</h1>` before the body. Choose one heading source for your site.

Update timestamps are optional. Display both the machine-readable date and its
site-localized text when available:

```html
{{#if page.updated_at_iso}}
  <time datetime="{{page.updated_at_iso}}">{{page.updated_at}}</time>
{{/if}}
```

## Page Layout Variants

Use `meta` for scalar options and `data` for structured values. A Page can include
this Preview Data fragment:

```json
{
  "meta": { "layout": "case-study" },
  "data": {
    "facts": [
      { "label": "Role", "value": "Design Engineering" },
      { "label": "Year", "value": "2026" }
    ]
  }
}
```

In `page.html`, select named partials rather than changing the route filename:

```html
{{#if_eq page.meta.layout "case-study"}}
  {{partial:page-case-study page=page}}
{{#else}}
  {{partial:page-default page=page}}
{{/if}}
```

Create both partials. In `partials/page-case-study.html`, render the passed facts:

```html
<dl>
  {{#for fact in partial.page.data.facts}}
    <dt>{{fact.label}}</dt>
    <dd>{{fact.value}}</dd>
  {{/for}}
</dl>
<div class="prose">{{partial.page.html}}</div>
```

Custom `meta` and `data` values are escaped as text. Use rendered body fields for
content HTML, and [custom HTML slots](../media-and-integrations/index.md#external-scripts)
for trusted site integrations.

## Site Identity And Footer

Use `site.logo.src` and `site.logo.alt` for a logo, with `site.title` as fallback
text. Site-specific scalar options belong in `site.meta`; a manifest's
`site_meta` entries describe them but do not supply values or defaults.

The footer can use the site's configured text and attribution preference:

```html
<footer>
  {{#if site.footer.copyright_text}}<p>{{site.footer.copyright_text}}</p>{{/if}}
  {{#if site.footer.attribution}}
    <p>Published with <a href="https://zeropress.app">ZeroPress</a></p>
  {{/if}}
</footer>
```

For field definitions, see [Post and Page details](../../../reference/theme-runtime/specs/v0.7/index.md#56-post-and-page-details) and [list summaries](../../../reference/theme-runtime/specs/v0.7/index.md#57-lists-pagination-and-archives).
