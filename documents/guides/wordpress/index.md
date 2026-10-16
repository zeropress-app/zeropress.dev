---
description: Keep WordPress as your editor and publish a static site from versioned files with ZeroPress Static and WXR Starter.
---

# Publish From WordPress

[ZeroPress Static](https://github.com/zeropress-app/zeropress-static) is a WordPress
plugin for publishing your content as a ZeroPress static site. Keep writing and
editing in WordPress; use the plugin to prepare the content and settings for a
separate build and hosting workflow.

You can start with the static site at a separate address while your current
WordPress site continues serving readers. Review the result before deciding
whether to move your main site address. This workflow uses your existing
WordPress installation as the editing environment.

## Two Files Drive The Build

The plugin generates two files at the root of your publishing repository:

| File | Contents |
| --- | --- |
| `wordpress-export.xml` | Published posts and pages, used categories and tags, public author information, selected classic menus, and media references |
| `wxr-import-base.json` | Site settings, menu assignments, search, feeds, footer information, newsletter links, custom code, and optional WordPress comments |

[WXR Starter](https://github.com/zeropress-app/zeropress-starter-wxr) reads these
files when you run `npm run build`. It uses `@zeropress/wxr-import` to produce
`zeropress-preview-data.json`, then `@zeropress/build` applies a theme and writes
the static site to `dist/`.

GitHub publishing replaces both files in one commit, giving each build a
versioned copy of the content and settings. The generated HTML can be served
independently of WordPress's page rendering. Media and optional comments remain
available through their configured URLs.

## Install And Publish

The plugin requires WordPress 6.8+, PHP 8.2+, and a single-site installation.

1. **Create the site repository.** Follow the
   [WXR Starter setup](https://github.com/zeropress-app/zeropress-starter-wxr#readme).
   Its Deploy to Cloudflare button creates a repository and a sample deployment.
   Keep `wordpress-export.xml` and `wxr-import-base.json` at the root of the
   existing branch you will publish to. You can also build locally and serve
   `dist/` on another static host.
2. **Install the plugin.** Download the installation ZIP named
   `zeropress-static-v<version>.zip` from
   [GitHub Releases](https://github.com/zeropress-app/zeropress-static/releases/latest).
   In WordPress, open **Plugins → Add New Plugin → Upload Plugin**, install the ZIP,
   and activate it.
3. **Save your site settings.** Open **ZeroPress → Settings**. The plugin reads
   the title, description, language, timezone, posts per page, and site icon from
   WordPress. Set the static site URL, choose menus, and configure the features
   you want. Search-engine crawling and WordPress comments start off.
4. **Configure GitHub publishing.** Save the repository URL and existing branch
   under **GitHub publishing**. Create a fine-grained token using
   **Only select repositories**, select only this publishing repository, and
   grant **Contents: Read and write**. Register the token and test the connection.
5. **Prepare and publish.** Open **ZeroPress → Publish**, select
   **Prepare publishing data**, and review the result. Confirm **Publish to GitHub**
   to update both files. Check your connected build service for the static site's
   build and deployment result.

Publishing is manual: editing or publishing a post in WordPress does not by
itself update the static site. Repeat the plugin's prepare-and-publish step when
you want to publish your changes. Manage the two generated files through the
plugin; subsequent publications replace direct edits to them.

Without a GitHub connection, you can prepare and download both files, place them
in a WXR starter checkout, and build it yourself.

## Media And Comments

Media URLs keep their existing addresses by default. Leave those addresses
accessible to readers. If your media is served elsewhere, configure **Media URL
replacements** before publishing. The rules rewrite exported URLs, including
the site icon; media files are served from the locations you provide. Ordinary
links inside article content retain their original addresses.

WordPress comment display and writing are separate options, both off by default.
You can display existing comments while keeping writing disabled. Enabled
writing uses the plugin's verification settings and WordPress's existing comment
policies. The static site URL is required for writing, and visitors must be able
to reach the configured WordPress REST API.

The WordPress admin can remain private while the required media and comment API
paths are accessible to visitors. See the plugin's
[API access guide](https://github.com/zeropress-app/zeropress-static#api-access)
for the exact paths and request methods. This WordPress publishing path uses
WordPress for comments; it does not require ZeroPress Edge.

## Content Support

The plugin exports published posts and pages without passwords, saved HTML,
static block markup, and selected classic menus. WordPress shortcodes, dynamic
blocks, and page builders are not executed. Custom post types and block navigation
are not converted. Check representative posts on your trial site before using it
as your readers' main destination.

For all settings and supported content, see the
[ZeroPress Static usage guide](https://github.com/zeropress-app/zeropress-static#readme).
For a one-time trial using WordPress's built-in XML exporter, see
[Try WordPress Content](../../getting-started/index.md#try-wordpress-content).
To change the static site's layout and styles, follow
[Customize a Theme](../theme-authoring/index.md).
