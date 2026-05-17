---
title: Static Search
description: Use ZeroPress native search artifacts or swap to Pagefind for advanced static search.
path: static-search
status: published
---

# Static Search

ZeroPress can emit dependency-free native search artifacts during a normal build:

- `/_zeropress/search.json`
- `/_zeropress/search.js`

The theme owns the search UI. The generated adapter owns loading, tokenizing, scoring, and returning search results.

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

## Indexed Content

`search.json` indexes published posts and pages. It does not index taxonomy routes, archive routes, `404.html`, feed files, sitemap files, or standalone raw front-page HTML.

When the front page is rendered from a page, that page is indexed with the URL `/`.

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
npx pagefind --site ./_site --root-selector ".prose"
```

You can narrow the indexed files if needed:

```bash
npx pagefind --site ./_site --root-selector ".prose" --glob "posts/**/*.html"
```

Pagefind writes its own `/pagefind/` assets after the ZeroPress build. A theme can keep its UI code small by isolating the search engine behind an adapter module:

```js
const searchApi = await import("/_zeropress/search.js");
// or, for a Pagefind-enabled deployment:
// const searchApi = await import("/pagefind/pagefind.js");
```

Avoid probing both paths on every page view. Pick the provider for the site or theme build so browsers do not repeatedly request a missing search engine file.
