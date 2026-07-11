---
description: Use ZeroPress native search artifacts or swap to Pagefind for advanced static search.
---

# Static Search

ZeroPress can emit dependency-free native search artifacts during a normal build:

- `/_zeropress/search.json`
- `/_zeropress/search.js`
- `/_zeropress/search_pagefind.js`

The theme owns the search UI. The generated adapter owns loading, tokenizing, scoring, and returning search results.

Native search is enabled only when both conditions are true:

- preview-data omits `site.search` or sets `site.search.enabled: true`
- the active theme declares `features.search: true`

When native search is disabled, ZeroPress does not emit `/_zeropress/search.json`, `/_zeropress/search.js`, or `/_zeropress/search_pagefind.js`. Templates always receive the effective object `site.search`, so search UI can be hidden with `{{#if site.search.enabled}}`.

## Native Search

Import the adapter from client-side theme JavaScript:

```js
const searchApi = await import("/_zeropress/search.js");
const result = await searchApi.search("ubuntu", { limit: 10 });

for (const item of result.results) {
  const data = await item.data();
  console.log(data.meta.title, data.url, item.score);
}
```

The result shape intentionally resembles a small subset of Pagefind:

```js
{
  results: [
    {
      id: "post:hello-world",
      score: 12.4,
      data: async () => ({
        url: "/posts/hello-world/",
        excerpt: "Short excerpt...",
        plain_excerpt: "Short excerpt...",
        meta: {
          title: "Hello World",
          type: "post",
          published_at_iso: "2026-05-01T00:00:00Z",
          updated_at_iso: "2026-05-02T00:00:00Z",
          categories: ["Guide"],
          tags: ["ZeroPress"]
        },
        sub_results: []
      })
    }
  ]
}
```

Only `options.limit` is supported in the native adapter. The default limit is `20`.

## Search UI Hooks

Themes own the search UI. Use these hook names when wiring client-side search
behavior so ZeroPress themes remain easier to compare and adapt:

```html
{{#if site.search.enabled}}
  <form role="search" data-zp-search>
    <input type="search" data-zp-search-input>
    <button type="submit" data-zp-search-submit>Search</button>
    <p data-zp-search-status></p>
    <div data-zp-search-results></div>
  </form>
{{/if}}
```

These hooks are conventions for theme JavaScript. ZeroPress does not
automatically attach UI behavior to them; the theme still imports
`/_zeropress/search.js` and renders results.

## Indexed Content

`search.json` indexes published posts and pages. It does not index taxonomy routes, archive routes, `404.html`, feed files, sitemap files, or standalone raw front-page HTML.

When the front page is rendered from a page, that page is indexed with the URL `/`.

Posts or pages with `discoverability: "delist"` are excluded from the native search index. `site.robots: { "allow_indexing": false }` does not disable native search; it only changes generated fallback `robots.txt`. Use preview-data `site.search: { "enabled": false }` to disable native search artifacts.

Each search item includes:

```json
{
  "id": "post:hello-world",
  "type": "post",
  "title": "Hello World",
  "url": "/posts/hello-world/",
  "excerpt": "Short excerpt...",
  "headings": ["Install", "Usage"],
  "categories": ["Guide"],
  "tags": ["ZeroPress"],
  "published_at_iso": "2026-05-01T00:00:00Z",
  "updated_at_iso": "2026-05-02T00:00:00Z",
  "content_text": "Plain searchable body text"
}
```

`content_text` is derived from rendered HTML after removing scripts, styles, tags, entities, and extra whitespace.

## Scoring

The native adapter uses a small BM25-like and TF-IDF-like scorer.

Current field weights are internal defaults:

- `title`: `5`
- `headings`: `3`
- `tags`: `2.5`
- `categories`: `2`
- `excerpt`: `1.5`
- `content_text`: `1`

Posts can receive a small recency boost. The maximum recency boost is `0.15`, so it should not overpower a clearly better text match.

These values are not preview-data or theme runtime configuration. Treat them as ZeroPress-owned defaults for the native adapter.

## Pagefind

For larger sites or higher search quality, Pagefind is a good post-build option:

```bash
npx pagefind@latest \
  --site ./_site \
  --output-subdir _zeropress/pagefind
```

Then replace the native adapter with the generated Pagefind adapter:

```bash
cp ./_site/_zeropress/search_pagefind.js ./_site/_zeropress/search.js
rm ./_site/_zeropress/search.json
```

Removing `search.json` is optional; it only removes the unused native index from a Pagefind deployment.

Pagefind writes its own `/_zeropress/pagefind/` assets after the ZeroPress build. The theme can keep importing the same adapter path:

```js
const searchApi = await import("/_zeropress/search.js");
```

Use `data-pagefind-body` on the actual post/page body wrapper instead of relying on a broad `--root-selector` such as `.prose` or `article`:

```html
<div
  class="prose"
  {{#if site.search.enabled}}{{#if_neq page.discoverability "delist"}}data-pagefind-body{{/if}}{{/if}}
>
  {{page.html}}
</div>
```

Do not add `data-pagefind-body` to layout-wide wrappers, archive pages, tag pages, category pages, or 404 pages unless those routes are intentionally searchable.
