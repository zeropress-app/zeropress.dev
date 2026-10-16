---
description: Deploy a ZeroPress starter and publish from WordPress with ZeroPress Static, from Studio, or from Markdown.
---

# Getting Started With ZeroPress

Choose how you want to manage your content:

- [WordPress](#publish-from-wordpress) to keep your editor and publish with ZeroPress Static.
- [Studio](#publish-with-studio) for writing and publishing in your browser.
- [Markdown](#publish-markdown) for a site maintained in Git.

You can also [try a manual WordPress WXR export](#try-wordpress-content).

Each site starter includes a Deploy to Cloudflare button that creates a GitHub
repository and deploys a sample site. You will need GitHub and Cloudflare accounts.
Keep the default build command `npm run build` and deploy command `npm run deploy`.
Cloudflare rebuilds the site when changes are pushed to the connected branch.

## Publish From WordPress

[ZeroPress Static](https://github.com/zeropress-app/zeropress-static) keeps WordPress
as your editor and prepares the files consumed by
[WXR Starter](https://github.com/zeropress-app/zeropress-starter-wxr). Start at a
separate site address while your existing WordPress site stays in place.

[![Deploy WXR Starter to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/zeropress-app/zeropress-starter-wxr/tree/latest)

1. Deploy WXR Starter using the button above. Keep `wordpress-export.xml` and
   `wxr-import-base.json` in the root of your new repository's publishing branch.
2. Download `zeropress-static-v<version>.zip` from
   [GitHub Releases](https://github.com/zeropress-app/zeropress-static/releases/latest).
   In WordPress, open **Plugins → Add New Plugin → Upload Plugin**, install it,
   and activate it.
3. Open **ZeroPress → Settings**. Save your site settings and GitHub publishing
   target, register a token for that repository with **Contents: Read and write**,
   and test the connection.
4. Open **ZeroPress → Publish**, prepare the data, review it, and confirm
   **Publish to GitHub**. The plugin replaces both files in one commit, and the
   starter's connected build service builds and deploys the static site.

Continue editing in WordPress, then use the plugin to publish each update.
See [WordPress Publishing](../guides/wordpress/index.md) for setup details,
download-based builds, media, and optional WordPress comments.

## Publish With Studio

Use [Studio Starter](https://github.com/zeropress-app/zeropress-starter-studio)
for the public site. Studio itself runs as a separate application.

[![Deploy Studio Starter to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/zeropress-app/zeropress-starter-studio/tree/latest)

1. If you do not have Studio yet, follow the
   [Studio Quick Start](https://studio.zeropress.dev/getting-started/).
2. Deploy Studio Starter using the button above.
3. Open `zeropress-preview-data.json` on your new repository's `main` branch and
   copy its GitHub file URL.
4. In Studio, open **Site Settings → Publishing**, paste the URL, and use
   **Create GitHub token** to create a token for that repository with
   **Contents: write** permission. Enter the token, enable publishing, check the
   connection, and save. Set your public site URL in Studio's site settings.
5. Create and publish a post in Studio. Open **Publish**, select
   **Publish to GitHub**, and confirm to replace the starter's sample content.

Studio confirms the GitHub update. Check the Cloudflare build result to see when
the public site has been updated. For local preview and theme changes, see the
[starter README](https://github.com/zeropress-app/zeropress-starter-studio#readme).

## Publish Markdown

[Markdown Starter](https://github.com/zeropress-app/zeropress-starter-markdown)
includes a documentation theme with navigation, search, and page outlines.

[![Deploy Markdown Starter to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/zeropress-app/zeropress-starter-markdown/tree/latest)

1. Deploy the starter using the button above.
2. Edit `documents/index.md` in your repository to change the home page.
3. Set your site title and public URL in `documents/.zeropress/config.json`.
4. Commit and push your changes to update the site.

The sample documents include navigation, frontmatter, and formatting examples.
See the [Build Pages guide](https://build-pages.zeropress.dev/) for Markdown and
configuration options, or the
[starter README](https://github.com/zeropress-app/zeropress-starter-markdown#readme)
for local preview commands.

## Try WordPress Content

[WXR Starter](https://github.com/zeropress-app/zeropress-starter-wxr) builds a
static site from a WordPress export. Use this route for a trial with WordPress's
built-in export; for ongoing publishing from the admin, use
[ZeroPress Static](#publish-from-wordpress).

[![Deploy WXR Starter to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/zeropress-app/zeropress-starter-wxr/tree/latest)

1. Deploy the starter using the button above. Choose a private repository if your
   export contains private information, such as commenters' email addresses.
2. In WordPress, open **Tools → Export**, select **All content**, and download
   the WXR `.xml` file.
3. Replace `wordpress-export.xml` in your repository with that file, keeping the
   filename, then commit and push.

Images and links in post and page content keep their original URLs. When enabled,
comments use the original WordPress REST API, so keep those resources available and check the
[comment requirements](https://github.com/zeropress-app/zeropress-starter-wxr#what-stays-on-wordpress).
The XML export itself is not served by the public site.

Replace the export and push whenever you want to refresh the site. To move your
content and media into Studio, follow
[WordPress Migration](https://studio.zeropress.dev/getting-started/wordpress-migration/)
and publish to a separate Studio Starter repository.

## Customize Or Build Locally

Each starter README covers local preview and theme changes. To create your own
theme, use [Customize a Theme](../guides/theme-authoring/index.md). If you already
generate Preview Data, see [CLI Tools](../guides/cli/index.md) for direct builds.
