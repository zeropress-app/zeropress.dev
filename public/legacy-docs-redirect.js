(function () {
  // Keep old documentation paths and section bookmarks pointing to their topics.
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

  var sections = {
    "/guides/theme-authoring": {
      "theme-authoring-guide": "/guides/theme-authoring/#customize-a-theme",
      "start-from-a-starter": "/guides/theme-authoring/#preview-your-changes",
      "theme-project-shape": "/guides/theme-authoring/#choose-what-to-edit",
      "keep-the-theme-package-small": "/guides/theme-authoring/#keep-site-files-separate",
      "shared-layout": "/guides/theme-authoring/templates-and-data/#shared-layout",
      "site-project-shape": "/guides/theme-authoring/#keep-site-files-separate",
      "manifest-basics": "/reference/theme-runtime/specs/v0.7/#3-themejson-v07",
      "rendering-model": "/guides/theme-authoring/templates-and-data/#route-data",
      "effective-site-feature-objects": "/guides/theme-authoring/navigation-and-collections/#optional-navigation-links",
      "template-syntax": "/guides/theme-authoring/templates-and-data/#variables-and-conditions",
      "partials": "/guides/theme-authoring/templates-and-data/#lists-and-partials",
      "route-templates": "/guides/theme-authoring/templates-and-data/#route-data",
      "listing-data": "/guides/theme-authoring/templates-and-data/#lists-and-partials",
      "post-and-page-data": "/guides/theme-authoring/templates-and-data/#post-and-page-bodies",
      "page-layout-variants": "/guides/theme-authoring/templates-and-data/#page-layout-variants",
      "markdown-bodies-and-h1": "/guides/theme-authoring/templates-and-data/#post-and-page-bodies",
      "menus": "/guides/theme-authoring/navigation-and-collections/#menus",
      "collections": "/guides/theme-authoring/navigation-and-collections/#curated-collections",
      "site-metadata": "/guides/theme-authoring/templates-and-data/#site-identity-and-footer",
      "footer": "/guides/theme-authoring/templates-and-data/#site-identity-and-footer",
      "media": "/guides/theme-authoring/media-and-integrations/#images",
      "markdown-styling": "/guides/theme-authoring/media-and-integrations/#markdown-styling",
      "search": "/guides/static-search/",
      "integrations": "/guides/theme-authoring/media-and-integrations/#external-scripts",
      "discoverability": "/reference/preview-data/specs/v0.7/#56-document-discovery",
      "newsletter-islands": "/guides/theme-authoring/media-and-integrations/#newsletter-links",
      "reference": "/reference/theme-runtime/"
    },
    "/reference": {
      "current-contract-references": "/reference/#current-contracts",
      "versioned-specs": "/reference/#specification-versions",
      "historical-contract-pages": "/reference/#specification-versions",
      "notes": "/reference/#current-contracts"
    },
    "/reference/preview-data": {
      "current-schema": "/reference/preview-data/specs/v0.7/",
      "required-top-level-fields": "/reference/preview-data/specs/v0.7/#3-top-level-contract",
      "core-site-fields": "/reference/preview-data/specs/v0.7/#4-site-contract",
      "content-fields": "/reference/preview-data/specs/v0.7/#5-content-contract",
      "discovery-policy": "/reference/preview-data/specs/v0.7/#56-document-discovery",
      "custom-html": "/reference/preview-data/specs/v0.7/#72-custom-html",
      "versioned-long-form-specs": "/reference/preview-data/specs/"
    },
    "/reference/theme-runtime": {
      "choose-the-right-document": "/reference/theme-runtime/#find-a-topic",
      "current-schema": "/reference/theme-runtime/specs/v0.7/",
      "required-theme-files": "/reference/theme-runtime/specs/v0.7/#2-runtime-contract",
      "package-resource-envelope": "/reference/theme-runtime/package-limits/",
      "manifest-basics": "/reference/theme-runtime/specs/v0.7/#3-themejson-v07",
      "template-syntax": "/reference/theme-runtime/specs/v0.7/#4-template-syntax",
      "render-context": "/reference/theme-runtime/specs/v0.7/#5-rendering-semantics",
      "full-spec": "/reference/theme-runtime/specs/v0.7/"
    }
  };

  function normalizePath(pathname) {
    pathname = pathname.replace(/\/+$/, "");
    if (pathname.endsWith("/index.html")) {
      return pathname.slice(0, -11);
    }
    return pathname.endsWith(".html") ? pathname.slice(0, -5) : pathname;
  }

  function lookup(map, key) {
    return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : "";
  }

  function redirect() {
    var pathname = normalizePath(window.location.pathname);
    var target = document.querySelector("article.doc-article.not-found")
      ? lookup(redirects, pathname)
      : "";
    var pageSections = lookup(sections, normalizePath(target || pathname));
    var sectionTarget = pageSections && lookup(pageSections, window.location.hash.slice(1));
    if (sectionTarget) {
      target = sectionTarget;
    }
    if (!target) {
      return;
    }

    var destination = new URL(target, window.location.origin);
    destination.search = window.location.search;
    if (!sectionTarget) {
      destination.hash = window.location.hash;
    }
    window.location.replace(destination.href);
  }

  redirect();
  window.addEventListener("hashchange", redirect);
}());
