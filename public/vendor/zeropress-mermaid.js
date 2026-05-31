(() => {
  const selectors = [
    'pre > code.language-mermaid',
    'pre > code.lang-mermaid',
  ].join(',');

  function mermaidTheme() {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'default';
  }

  function prepareMermaidBlocks() {
    return Array.from(document.querySelectorAll(selectors)).map((code, index) => {
      const pre = code.parentElement;
      const container = document.createElement('div');
      container.className = 'mermaid zp-mermaid';
      container.dataset.mermaidIndex = String(index + 1);
      container.textContent = code.textContent || '';
      pre.replaceWith(container);
      return { pre, container };
    });
  }

  async function renderMermaid() {
    const mermaid = window.mermaid;
    if (!mermaid) {
      return;
    }

    const entries = prepareMermaidBlocks();
    if (!entries.length) {
      return;
    }

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: mermaidTheme(),
    });

    try {
      await mermaid.run({
        nodes: entries.map((entry) => entry.container),
      });
    } catch (error) {
      for (const { pre, container } of entries) {
        if (container.isConnected) {
          pre.classList.add('zp-mermaid-error');
          container.replaceWith(pre);
        }
      }
      console.warn('[zeropress] Mermaid rendering failed.', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMermaid, { once: true });
  } else {
    renderMermaid();
  }
})();
