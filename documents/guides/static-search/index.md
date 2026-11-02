---
description: Use ZeroPress native search artifacts or swap to Pagefind for advanced static search.
---

# Static Search

ZeroPress can emit dependency-free native search artifacts during a normal build:

- `/_zeropress/search.json`
- `/_zeropress/search.js`
- `/_zeropress/search_pagefind.js`

The theme owns the search UI. The generated adapter owns loading, tokenizing, scoring, and returning search results.

Search is enabled only when both conditions are true:

- preview-data omits `site.search` or sets `site.search.enabled: true`
- the active theme declares `features.search: true`

When search is disabled, ZeroPress does not emit `/_zeropress/search.json`, `/_zeropress/search.js`, or `/_zeropress/search_pagefind.js`. Templates always receive the effective object `site.search`, so search UI can be hidden with `{{#if site.search.enabled}}`.

Feature settings take precedence over `--skip-search-index` and
`generateSearchIndex: false`: neither option enables search or produces search
files when Preview Data disables search or the theme does not declare search
support. When search is enabled, skipping native indexing leaves
`site.search.enabled`, the search UI, and both adapters unchanged. The native
adapter then returns no results until an external search step replaces it.
See [Index Generation And Limits](#index-generation-and-limits) for the output
rules, including genuinely empty sites.

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

When a native index is generated, `search.json` indexes published posts and pages. It does not index taxonomy routes, archive routes, `404.html`, feed files, sitemap files, or standalone raw front-page HTML.

When the front page is rendered from a page, that page is indexed once, with the URL `/`.

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

`content_text` is derived from rendered HTML by removing non-visible content and tags, decoding entities, and collapsing whitespace.

## Index Generation And Limits

`@zeropress/build` accepts the value-free `--skip-search-index` flag. For
JavaScript builds, pass `generateSearchIndex: false` in the fourth argument to
`runBuild()`, or in `options` to `buildSite()` / `buildSiteFromThemeDir()`.
Without the CLI flag, or with the API option omitted or set to `true`, the
builder generates the native index subject to automatic limits. This is a build option, not a Preview Data or theme field.

The first matching rule applies:

| Condition | Search output | Search warning |
| --- | --- | --- |
| Preview Data or theme disables search | No `search.json`, `search.js`, or `search_pagefind.js` | None |
| No searchable records | `search.json` contains `[]` and a final newline; both adapters remain | None, even with the skip option |
| Indexing explicitly skipped | One non-searchable placeholder and both adapters | `NATIVE_SEARCH_INDEX_SKIPPED`, reason `requested` |
| More than 5,000 searchable records | One non-searchable placeholder and both adapters | `NATIVE_SEARCH_INDEX_SKIPPED`, reason `record_limit` |
| JSON size at least 5 MiB | One non-searchable placeholder and both adapters | `NATIVE_SEARCH_INDEX_SKIPPED`, reason `size_limit` |
| JSON size at least 2 MiB and less than 5 MiB | Complete native index and both adapters | `NATIVE_SEARCH_INDEX_LARGE` |
| JSON size less than 2 MiB | Complete native index and both adapters | None |

Size means uncompressed UTF-8 bytes, including the existing two-space JSON
indentation and final newline. One MiB is `1024 × 1024` bytes. Record counts
use the [indexed content](#indexed-content) rules above: published,
non-delisted posts and pages, including a page front page. Exactly 5,000
records are allowed if the size limit is not reached.

These limits cannot be bypassed. The builder checks record counts before
extracting search body text, and stops incremental size measurement at the
limit instead of serializing a complete oversized index. It never emits a
partial index. Indexing omissions do not fail the build or alter other site
outputs.

### Skipped And Empty Indexes

For a site with searchable content, explicit or automatic omission replaces
the entire `search.json` with this record and a final newline:

```json
[
  {
    "id": "zeropress:search-omitted",
    "type": "page",
    "title": "",
    "url": "/",
    "excerpt": "",
    "headings": [],
    "categories": [],
    "tags": [],
    "published_at_iso": "",
    "updated_at_iso": "",
    "content_text": ""
  }
]
```

Its searchable fields are empty, so the native adapter returns
`{ results: [] }` for every query. The array length of one represents a
placeholder, not a searchable page. It allows existing Pagefind replacement
steps to continue indexing the actual HTML.

When search is enabled, a site with no searchable content keeps `[]` instead,
including a site whose posts and pages are all delisted. It receives no search warning, even when
`--skip-search-index` is present. The three existing search files remain;
there is no separate search manifest. Neither omission nor an empty index
changes the effective `site.search.enabled` value or hides theme search UI.

### Build Warnings

The build returns at most one search warning in `result.warnings`, alongside
any other build warnings. The JavaScript API does not log it; the CLI prints
it once to stderr and exits successfully when the build succeeds.

- `NATIVE_SEARCH_INDEX_LARGE` contains `byteLength` for the complete index and
  the actual `recordCount`, and recommends an external index such as Pagefind.
- `NATIVE_SEARCH_INDEX_SKIPPED` contains `reason` (`requested`, `record_limit`,
  or `size_limit`) and the actual `recordCount`. It states that native search
  returns no results. A size-limit warning does not report an exact full size,
  because measurement stops at the limit.

## Pagefind

For larger sites or higher search quality, use Pagefind after the ZeroPress
build. Keep search enabled in Preview Data and the theme so ZeroPress emits
both adapters and the theme renders its search UI.

Use `data-pagefind-body` on the actual post/page body wrapper instead of relying on a broad `--root-selector` such as `.prose` or `article`:

```html
<div
  class="prose"
  {{#if site.search.enabled}}{{#if_neq page.discoverability "delist"}}data-pagefind-body{{/if}}{{/if}}
>
  {{page.html}}
</div>
```

Use the equivalent `post` fields in the post template. Do not add
`data-pagefind-body` to layout-wide wrappers, archive pages, tag pages,
category pages, or 404 pages unless those routes are intentionally searchable.

When building with `@zeropress/build`, skip native indexing work if Pagefind
will supply the final search index:

```bash
npx @zeropress/build ./theme \
  --data ./zeropress-preview-data.json \
  --out ./_site \
  --skip-search-index
```

The flag does not run Pagefind automatically. Before running the following
indexing and replacement commands, check the build's search state:

- If search is disabled, skip Pagefind and adapter replacement; the search
  files are absent even with `--skip-search-index`.
- If `search.json` is `[]`, skip both steps and retain the empty native index.
  With no marked searchable bodies, Pagefind could otherwise crawl unmarked
  pages such as archives or delisted content.
- If the array is nonempty, including the omission placeholder, run Pagefind
  against the rendered HTML. The WXR starter's existing Pagefind script
  already follows these checks.

```bash
npx pagefind@latest \
  --site ./_site \
  --output-subdir _zeropress/pagefind
```

After Pagefind succeeds, replace the native adapter with the generated
Pagefind adapter:

```bash
cp ./_site/_zeropress/search_pagefind.js ./_site/_zeropress/search.js
rm ./_site/_zeropress/search.json
```

Removing `search.json` is optional; it only removes the unused native index
or placeholder from a Pagefind deployment. Pagefind indexes HTML, not the
records in `search.json`, so skipping native indexing does not reduce its
searchable content.

Pagefind writes its own `/_zeropress/pagefind/` assets after the ZeroPress
build. The theme can keep importing the same adapter path:

```js
const searchApi = await import("/_zeropress/search.js");
```
