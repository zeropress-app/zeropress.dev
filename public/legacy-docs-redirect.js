(function () {
  // GitHub Pages serves 404.html for removed routes, so keep redirects limited
  // to the exact legacy documentation paths that moved within zeropress.dev.
  if (!document.querySelector("article.doc-article.not-found")) {
    return;
  }

  var redirects = {
    "/cli": "/guides/cli/",
    "/cli/index.md": "/guides/cli/index.md",
    "/docs": "/reference/",
    "/docs/index.md": "/reference/index.md",
    "/static-search": "/guides/static-search/",
    "/static-search/index.md": "/guides/static-search/index.md",
    "/theme-authoring": "/guides/theme-authoring/",
    "/theme-authoring/index.md": "/guides/theme-authoring/index.md",
    "/spec/preview-data-v0.5": "/reference/preview-data/specs/v0.5/",
    "/spec/preview-data-v0.5.md": "/reference/preview-data/specs/v0.5/index.md",
    "/spec/preview-data-v0.6": "/reference/preview-data/specs/v0.6/",
    "/spec/preview-data-v0.6.md": "/reference/preview-data/specs/v0.6/index.md",
    "/spec/preview-data-v0.7": "/reference/preview-data/specs/v0.7/",
    "/spec/preview-data-v0.7.md": "/reference/preview-data/specs/v0.7/index.md",
    "/spec/theme-runtime-v0.5": "/reference/theme-runtime/specs/v0.5/",
    "/spec/theme-runtime-v0.5.md": "/reference/theme-runtime/specs/v0.5/index.md",
    "/spec/theme-runtime-v0.6": "/reference/theme-runtime/specs/v0.6/",
    "/spec/theme-runtime-v0.6.md": "/reference/theme-runtime/specs/v0.6/index.md",
    "/spec/theme-runtime-v0.7": "/reference/theme-runtime/specs/v0.7/",
    "/spec/theme-runtime-v0.7.md": "/reference/theme-runtime/specs/v0.7/index.md"
  };

  var pathname = window.location.pathname;
  if (pathname.length > 1) {
    pathname = pathname.replace(/\/+$/, "");
  }
  if (pathname.endsWith("/index.html")) {
    pathname = pathname.slice(0, -11);
  } else if (pathname.endsWith(".html")) {
    pathname = pathname.slice(0, -5);
  }

  var target = Object.prototype.hasOwnProperty.call(redirects, pathname)
    ? redirects[pathname]
    : "";
  if (!target) {
    return;
  }

  window.location.replace(target + window.location.search + window.location.hash);
}());
