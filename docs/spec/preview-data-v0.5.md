# ZeroPress Preview Data Spec v0.5

> Status: Active (current preview-data contract)

## 0. Core Philosophy

- Preview-data is the canonical theme-facing content payload.
- Preview-data is data-only and does not contain render-ready application behavior.
- Themes consume preview-data; build tooling is responsible for rendering and file emission.
- Preview-data must be safe to validate independently of CMS or build implementation details.

## 1. Scope

Preview-data v0.5 defines the public payload contract used by ZeroPress build and preview tooling.

In scope:

- Top-level preview-data payload structure
- Site metadata exposed to themes
- Content collections for authors, posts, pages, categories, and tags
- Enabled menus keyed by `menu_id`
- Contract-level safety rules for slug and route-related values

Out of scope:

- CMS authoring workflows
- Database schema or admin API request formats
- Theme manifest rules (`theme.json`)
- Final filesystem write policy inside the build engine

## 2. Top-Level Contract

Preview-data v0.5 is a JSON object with the following required top-level fields:

- `version`
- `generator`
- `generated_at`
- `site`
- `content`
- `menus`

Key points:

- `version` must be `"0.5"`.
- `generated_at` is a UTC date-time string.
- `content` is data-only and does not include pre-rendered archive/category/tag route arrays.
- `menus` is always present and keyed by enabled `menu_id` values.

The machine-readable schema is:

- [Preview Data v0.5 Schema](/schemas/preview-data.v0.5.schema.json)

## 3. Content Model

### 3.1 `site`

`site` contains theme-facing site metadata such as:

- `title`
- `description`
- `url`
- `mediaBaseUrl`
- `locale`
- `postsPerPage`
- `dateFormat`
- `timeFormat`
- `timezone`
- `disallowComments`

`site` may include additional future-facing fields unless otherwise restricted by the schema version.

### 3.2 `content`

`content` contains these collections:

- `authors`
- `posts`
- `pages`
- `categories`
- `tags`

Important v0.5 notes:

- Posts keep both `id` and `public_id`.
- Pages, categories, and tags do not carry internal ids in the public contract.
- Post and page bodies use raw `content` plus `document_type`.
- Taxonomy membership on posts is represented by `category_slugs[]` and `tag_slugs[]`.

### 3.3 `menus`

`menus` is an object map keyed by `menu_id`.

Each menu contains:

- `name`
- `items`

Each menu item contains:

- `title`
- `url`
- `type`
- `target`
- `children`

## 4. Slug Contract

In preview-data v0.5, every content `slug` is defined as a safe single URL path segment.

This applies to:

- `content.posts[].slug`
- `content.pages[].slug`
- `content.categories[].slug`
- `content.tags[].slug`
- `content.posts[].category_slugs[]`
- `content.posts[].tag_slugs[]`

### 4.1 Allowed

- Unicode characters, including Hangul
- Letters and digits from any supported script
- Internal punctuation that does not create path ambiguity and is accepted by the schema/runtime validators

### 4.2 Forbidden

- Empty or whitespace-only values
- Path separators: `/` and `\`
- Reserved dot segments: `.` and `..`
- Percent-encoded slug segments
- ASCII control characters, including NUL

### 4.3 Security Intent

These rules exist to ensure that a preview-data slug cannot be misinterpreted as:

- a multi-segment route
- a parent-directory traversal sequence
- an encoded path-escape sequence
- an ambiguous filesystem output path

Preview-data must remain safe even when produced or consumed by tooling outside the main CMS.

## 5. URL-Like Fields vs Slugs

Slug fields and URL-like fields have different roles.

- Slugs are safe single path segments.
- URL-like fields such as `featured_image`, `avatar`, or menu item `url` may represent either absolute URLs or safe relative paths, depending on the field contract.

A value that is valid for a URL-like field is not automatically valid for a slug field.

## 6. Validation and Enforcement Layers

Preview-data security is intentionally enforced in multiple layers.

### 6.1 Contract Validation

The schema and preview-data validator reject contract-invalid slug values before build rendering begins.

This is the layer that communicates:

- what a valid preview-data slug is
- which fields the rule applies to
- why a payload is contract-invalid

### 6.2 Build Enforcement

Build tooling must independently enforce output path safety even when preview-data has already been validated.

This is required because:

- build is an independent process
- preview-data may be produced by external tooling
- final filesystem writes must not rely on upstream validation alone

Schema validation does not replace final path-safety checks in the build engine.

## 7. Validation Profile

Errors include:

- missing required top-level fields
- invalid site field types
- missing required content fields
- invalid `document_type`
- invalid menu item structure
- invalid slug values that violate the safe single-segment contract

Notes:

- slug validation is intentionally stricter than a plain non-empty string check
- build implementations should still reject any computed output path that attempts to escape the build root

## 8. Compatibility Notes

- `v0.5` is the current preview-data contract.
- Earlier preview-data versions are historical and may differ in content shape and route-related fields.
- Tooling may evolve, but public `v0.5` payloads must continue to satisfy the published schema and slug safety contract.

## 9. Normative vs Informative Summary

| Item | Classification | Notes |
| --- | --- | --- |
| top-level `version`, `generator`, `generated_at`, `site`, `content`, `menus` | Normative (Required) | Missing fields are contract-invalid |
| `content.posts[].slug`, `content.pages[].slug`, `content.categories[].slug`, `content.tags[].slug` | Normative (Required) | Must be safe single path segments |
| `content.posts[].category_slugs[]`, `content.posts[].tag_slugs[]` | Normative (Required) | Each referenced slug must also be a safe single path segment |
| Unicode slug content including Hangul | Informative (Allowed) | Allowed when all path-safety rules are still satisfied |
| `/`, `\`, `.`, `..`, percent-encoded slug segments, control characters | Normative (Forbidden) | Rejected for security and path clarity |
| final output path enforcement in build tooling | Normative (Required) | Must be enforced independently of schema validation |
