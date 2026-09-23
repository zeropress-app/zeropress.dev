---
description: Add menus, paginate post lists, and use collections for curated content and previous/next links.
---

# Navigation and Collections

Menus link to site destinations. Collections group selected posts and pages in
an explicit order; they can also provide previous/next links.

## Menus

For a standard menu, render the matching Preview Data menu with the built-in
helper. It includes nested items:

```html
<nav aria-label="Primary">
  {{menu:primary}}
</nav>
```

For custom top-level markup, iterate over the items:

```html
{{#if menus.primary.items}}
  <nav aria-label="Primary">
    {{#for item in menus.primary.items}}
      <a href="{{item.url}}"{{#if_eq item.target "_blank"}} target="_blank" rel="noopener noreferrer"{{/if}}>
        <span>{{item.title}}</span>
        {{#if item.meta.badge}}<span class="badge">{{item.meta.badge}}</span>{{/if}}
      </a>
    {{/for}}
  </nav>
{{/if}}
```

Add child-item rendering if your custom menu uses `item.children`. Menu targets
must exist; use a path such as `/guide/#installation` for a section link, rather
than a placeholder `#`.

Configure menus through Studio or the
[Markdown Guide](https://build-pages.zeropress.dev/). Custom generators can use
the [Preview Data menu contract](../../../reference/preview-data/specs/v0.7/index.md#61-menus).

## Post List Pagination

Listing routes provide `posts.items` and a `pagination` object. After rendering
the cards, add previous/next page links:

```html
{{#if pagination.enabled}}
  <nav aria-label="Post pages">
    {{#if pagination.has_prev}}
      <a href="{{pagination.prev_url}}" rel="prev">Previous</a>
    {{/if}}
    <span>Page {{pagination.current_page}} of {{pagination.total_pages}}</span>
    {{#if pagination.has_next}}
      <a href="{{pagination.next_url}}" rel="next">Next</a>
    {{/if}}
  </nav>
{{/if}}
```

In `index.html`, wrap post-index content in `{{#if route.is_post_index}}` when
it shares the template with a different front-page layout. Numbered pagination
can use `pagination.pages` or the shorter `pagination.window`. Handle `window`
gaps as text, not links; the [pagination contract](../../../reference/theme-runtime/specs/v0.7/index.md#pagination)
defines both item shapes.

## Curated Collections

A theme that reads a named collection can describe it in `theme.json`:

```json
{
  "collection_slots": {
    "featured": {
      "title": "Featured",
      "description": "Cards shown on the home page."
    }
  }
}
```

The site supplies the collection's members. This manifest fragment describes the
slot; it does not populate the collection or require it to exist.

```html
{{#if collections.featured.count}}
  <section aria-label="Featured">
    {{#for item in collections.featured.items}}
      <a href="{{item.url}}">{{item.title}}</a>
    {{/for}}
  </section>
{{/if}}
```

See the [collection contract](../../../reference/preview-data/specs/v0.7/index.md#63-collections)
for Post and Page references. Markdown sites select source files in their
Build Pages `collections` configuration.

## Reading Order

A Page or Post in a collection receives a cursor with its position and neighbors.
Use `page.collection_cursor` for a documentation page's reading order:

```html
{{#if page.collection_cursor.collection_title}}
  <p>{{page.collection_cursor.collection_title}}</p>
{{/if}}
<nav aria-label="Reading order">
  {{#if page.collection_cursor.prev}}
    <a href="{{page.collection_cursor.prev.url}}" rel="prev">
      Previous: {{page.collection_cursor.prev.title}}
    </a>
  {{/if}}
  {{#if page.collection_cursor.next}}
    <a href="{{page.collection_cursor.next.url}}" rel="next">
      Next: {{page.collection_cursor.next.title}}
    </a>
  {{/if}}
</nav>
```

Use `post.collection_cursor` for posts. These aliases select the first matching
collection in Preview Data order. When a document belongs to several collections,
use `page.collection_cursors.<id>` or `post.collection_cursors.<id>` to select one.
A theme using only the generic cursor does not need named `collection_slots`.
See the [cursor fields](../../../reference/theme-runtime/specs/v0.7/index.md#collection-cursors)
for position, boundary flags, and neighbor summaries.

## Optional Navigation Links

Read each feature's effective `.enabled` value before displaying its link:

```html
{{#if site.feed.enabled}}<a href="{{site.feed.url}}">RSS</a>{{/if}}
{{#if site.archive.enabled}}<a href="{{site.archive.url}}">Archive</a>{{/if}}
```

These objects exist even when disabled. See
[effective feature state](../../../reference/theme-runtime/specs/v0.7/index.md#52-effective-site-feature-state)
for search, comments, and post-index conditions. Document
[discoverability](../../../reference/preview-data/specs/v0.7/index.md#56-document-discovery)
affects automatic lists; it is not access control.
