---
description: Fixed resource limits for ZeroPress theme directories and in-memory theme packages.
---

# Theme Package Limits

ZeroPress applies fixed resource limits to every theme package. These limits prevent unexpectedly large inputs and excessive directory entries from exhausting the build or validation process.

## Hard Limits

| Resource | Maximum |
| --- | ---: |
| Package size | 4 MiB (4,194,304 bytes) |
| One file | 1 MiB (1,048,576 bytes) |
| Package entries | 128 |

The maximum values are inclusive. A 1 MiB file is valid; a 1 MiB plus one-byte file is not.

These are product hard limits. They cannot be changed through an environment variable or CLI option.

## What Counts

- An entry is an included file or directory in the theme package.
- Package size is the sum of included file bytes.
- UTF-8 theme text is counted by encoded byte length rather than JavaScript character count.

Theme package paths reject absolute paths, literal backslashes, controls, empty segments, and exact `.` or `..` segments. A double-dot substring in an ordinary filename such as `assets/name..txt` is valid. Directory adapters also reject entries that collide after NFC and case normalization so a package has one cross-platform path identity. Symbolic links are never valid theme entries, including internal, external, directory, and dangling links.

## Where Limits Are Enforced

- `@zeropress/theme-validator` enforces entry, per-file, and total-size limits for already-loaded file maps.
- `@zeropress/theme validate` checks theme directories before loading their contents into the validation model.
- `@zeropress/build-core` checks theme directories before reading file bodies and rechecks in-memory theme packages before rendering.
- `@zeropress/build` and custom-theme Build Pages workflows inherit the Build Core limits.

A theme directory may still satisfy the Theme Runtime manifest schema while being rejected because its package resource envelope is invalid; JSON Schema validates `theme.json`, not filesystem size.

The final theme input entry must be a real directory rather than a symbolic link, and entries inside the package cannot be symbolic links. Symbolic links in ancestor path components are allowed for read inputs. Validation, development preview, and Build Core pin an accepted input root to its canonical path before use, so later retargeting of an ancestor alias does not change the selected root.

## Authoring Guidance

Keep the theme package focused on reusable presentation code:

- templates and partials
- theme CSS and small progressive-enhancement JavaScript
- small icons and decorative assets that belong to the reusable theme

Do not include `node_modules`, build output, source maps, large media libraries, videos, content uploads, or site-specific downloadable files with a theme. Put site-owned files in the site's public passthrough directory. Store large media in the site's media origin or object storage and reference it through Preview Data.

If a local thumbnail would make the package unnecessarily large, `theme.json.thumbnail` may use a credential-free absolute HTTP(S) URL instead.

## Related Documentation

- [Theme Runtime Reference](../index.md)
- [Theme Runtime v0.7 Long-Form Spec](../specs/v0.7/index.md)
- [Theme Authoring Guide](../../../guides/theme-authoring/index.md)
- [CLI Tools](../../../guides/cli/index.md)
