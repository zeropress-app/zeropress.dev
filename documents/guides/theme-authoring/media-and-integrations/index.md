---
description: Render media, style Markdown, and add search, comments, newsletters, and site scripts to a theme.
---

# Media and Integrations

Keep content readable in HTML and CSS. Add JavaScript where an integration
needs interaction, such as search results or a comments form.

## Images

Preview Data media fields, including featured images, avatars, and logos, accept
credential-free HTTP(S) URLs with a non-root path, or root-relative paths:

- `https://media.example.com/photo.jpg`
- `/images/photo.jpg`

Bare or dot-relative paths such as `images/photo.jpg` and `./images/photo.jpg`
are invalid for these fields. A root-relative path resolves against
`site.media_origin` when set; otherwise it stays root-relative to the public site.
For example, `public/images/photo.jpg` can be referenced as `/images/photo.jpg`
when `site.media_origin` is empty.

When Preview Data includes matching media metadata, use it for dimensions and
alternative text. Managed raster images can also provide `srcset` when media-domain
delivery is configured:

```html
{{#if post.featured_media.srcset}}
  <img
    src="{{post.featured_image}}"
    srcset="{{post.featured_media.srcset}}"
    sizes="(min-width: 900px) 720px, 100vw"
    width="{{post.featured_media.width}}"
    height="{{post.featured_media.height}}"
    alt="{{post.featured_media.alt}}"
    loading="lazy"
    decoding="async"
  >
{{#else_if post.featured_image}}
  <img src="{{post.featured_image}}" alt="{{post.featured_media.alt}}" loading="lazy" decoding="async">
{{/if}}
```

Use `page.featured_media` for pages and `post.author.avatar_media` for author
images. See [media origin and delivery](../../../reference/preview-data/specs/v0.7/index.md#44-media-origin-and-delivery)
for the delivery settings and [media metadata](../../../reference/preview-data/specs/v0.7/index.md#55-managed-media-metadata)
for registry fields. The [rendered media companion](../../../reference/theme-runtime/specs/v0.7/index.md#media-companions)
defines the fields available in templates.

## Markdown Styling

ZeroPress renders tables, task lists, alerts, and highlighted code during the
build. Give your content wrapper styles for these elements:

| Content | Selectors |
| --- | --- |
| Tables and aligned cells | `table`, `th`, `td`, `.zp-align-left`, `.zp-align-center`, `.zp-align-right` |
| Task lists | `.contains-task-list`, `.task-list-item`, `.task-list-item-checkbox` |
| Alerts and admonitions | `.zp-alert`, `.zp-alert--note`, `.zp-alert--tip`, `.zp-alert--warning` |
| Code | `pre`, `code`, `.hljs-keyword`, `.hljs-string`, `.hljs-comment` |
| Media | `figure`, `figcaption`, `img`, `video`, `audio` |

For example, keep long code lines scrollable inside the content area:

```css
.prose pre {
  max-width: 100%;
  overflow-x: auto;
  padding: 1rem;
  border-radius: 0.5rem;
}
```

A browser-side syntax highlighter is unnecessary for build-rendered Markdown.
Mermaid fences remain code blocks; include a theme script if you want diagrams.
The [Markdown rendering reference](../../../reference/theme-runtime/specs/v0.7/index.md#53-markdown-rendering)
describes supported markup and sanitization.

## Table Of Contents

Markdown H2–H4 headings produce `page.toc` or `post.toc` entries. Render a Page's
TOC with its generated fragment links:

```html
{{#if page.toc}}
  <aside aria-label="Table of contents">
    <ol>
      {{#for item in page.toc}}
        <li class="toc-level-{{item.level}}">
          <a href="{{item.href}}">{{item.title}}</a>
        </li>
      {{/for}}
    </ol>
  </aside>
{{/if}}
```

## Search And Comments

Use the [Static Search guide](../../static-search/index.md) to connect a search
form to native search or Pagefind. A theme with search UI declares
`features.search: true` and checks `site.search.enabled` before showing it.

For comments, declare `features.comments: true` and show the theme's comments
partial only on eligible routes:

```html
{{#if comments.enabled}}
  {{partial:comments-island}}
{{/if}}
```

The partial and its JavaScript connect to the configured provider.
`site.comments.enabled` alone does not establish that a particular Post or Page
accepts comments. Use the route's `comments` data, described in the
[route comments contract](../../../reference/theme-runtime/specs/v0.7/index.md#59-route-comments).
The Studio and WXR starters include a comments implementation you can adapt.

## Newsletter Links

When Preview Data provides an enabled newsletter with a signup URL, a theme can
show a normal link:

```html
{{#if site.newsletter.enabled}}
  {{#if site.newsletter.signup_url}}
    <a href="{{site.newsletter.signup_url}}">Subscribe</a>
  {{/if}}
{{/if}}
```

An `embed_url` can supply an iframe for a theme-owned dialog. The provider handles
subscriptions; ZeroPress does not inject provider scripts. Build Pages has no
`site.newsletter` config field, so Markdown sites can use custom HTML or
theme-specific markup for this integration.

## External Scripts

Put reusable theme behavior in a partial that loads an asset such as
`/assets/theme.js`. For site-specific analytics or verification, use Preview
Data's trusted `custom_html` slots. This is a Preview Data fragment:

```json
{
  "custom_html": {
    "head_end": "<meta name=\"site-verification\" content=\"example-value\">",
    "body_end": "<script defer src=\"/vendor/site.js\"></script>"
  }
}
```

Place `site.js` in `public/vendor/` for that example. Slots insert the strings
without sanitizing them or rewriting asset URLs. Include closing `</head>` and
`</body>` tags in the layout so configured slots have an insertion point.
For Markdown sites, use the [Build Pages configuration](https://build-pages.zeropress.dev/).
