<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
>
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ZeroPress Sitemap</title>
        <style>
          :root {
            color-scheme: light dark;
            --bg: #f8fafc;
            --panel: #ffffff;
            --text: #111827;
            --muted: #64748b;
            --border: #dbe3ee;
            --accent: #2563eb;
            --accent-soft: #dbeafe;
            --code: #0f172a;
          }

          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0b1120;
              --panel: #111827;
              --text: #e5e7eb;
              --muted: #94a3b8;
              --border: #253247;
              --accent: #60a5fa;
              --accent-soft: #172554;
              --code: #f8fafc;
            }
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: var(--bg);
            color: var(--text);
            font-family:
              Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
              "Segoe UI", sans-serif;
            line-height: 1.5;
          }

          main {
            width: min(1120px, calc(100% - 32px));
            margin: 0 auto;
            padding: 48px 0;
          }

          header {
            margin-bottom: 28px;
          }

          .eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: 1px solid var(--border);
            border-radius: 999px;
            background: var(--accent-soft);
            color: var(--accent);
            font-size: 13px;
            font-weight: 700;
            padding: 5px 10px;
          }

          h1 {
            margin: 16px 0 8px;
            font-size: clamp(32px, 6vw, 56px);
            line-height: 1.05;
            letter-spacing: 0;
          }

          p {
            margin: 0;
            color: var(--muted);
            max-width: 720px;
          }

          .panel {
            overflow: hidden;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--panel);
            box-shadow: 0 16px 40px rgb(15 23 42 / 8%);
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            border-bottom: 1px solid var(--border);
            padding: 14px 16px;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: color-mix(in srgb, var(--panel) 84%, var(--bg));
            color: var(--muted);
            font-size: 12px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          tr:last-child td {
            border-bottom: 0;
          }

          a {
            color: var(--accent);
            overflow-wrap: anywhere;
            text-decoration-thickness: 0.08em;
            text-underline-offset: 0.18em;
          }

          .meta {
            color: var(--muted);
            font-family:
              ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
              "Liberation Mono", monospace;
            font-size: 13px;
            white-space: nowrap;
          }

          footer {
            margin-top: 20px;
            color: var(--muted);
            font-size: 14px;
          }

          @media (max-width: 760px) {
            main {
              width: min(100% - 24px, 1120px);
              padding: 32px 0;
            }

            table,
            thead,
            tbody,
            tr,
            th,
            td {
              display: block;
            }

            thead {
              display: none;
            }

            tr {
              border-bottom: 1px solid var(--border);
              padding: 12px 0;
            }

            tr:last-child {
              border-bottom: 0;
            }

            td {
              border-bottom: 0;
              padding: 4px 14px;
            }

            td::before {
              content: attr(data-label);
              display: block;
              color: var(--muted);
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.04em;
              margin-bottom: 2px;
              text-transform: uppercase;
            }

            .meta {
              white-space: normal;
            }
          }
        </style>
      </head>
      <body>
        <main>
          <header>
            <span class="eyebrow">Sitemap</span>
            <h1>ZeroPress Sitemap</h1>
            <p>
              This sitemap is generated by ZeroPress and styled for browser
              viewing. Search engines consume the same underlying XML data.
            </p>
          </header>

          <section class="panel" aria-label="Sitemap URLs">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Last Modified</th>
                  <th>Change Frequency</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td data-label="URL">
                      <a>
                        <xsl:attribute name="href">
                          <xsl:value-of select="sitemap:loc" />
                        </xsl:attribute>
                        <xsl:value-of select="sitemap:loc" />
                      </a>
                    </td>
                    <td data-label="Last Modified" class="meta">
                      <xsl:value-of select="sitemap:lastmod" />
                    </td>
                    <td data-label="Change Frequency" class="meta">
                      <xsl:value-of select="sitemap:changefreq" />
                    </td>
                    <td data-label="Priority" class="meta">
                      <xsl:value-of select="sitemap:priority" />
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </section>

          <footer>
            <xsl:value-of select="count(sitemap:urlset/sitemap:url)" />
            URLs in this sitemap.
          </footer>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
