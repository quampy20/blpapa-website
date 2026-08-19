// Minimal Markdown renderer.
//
// Why hand-rolled instead of `marked` or `markdown-it`: CLAUDE.md §2 caps this
// project at "a markdown parser and a template engine at most" in dev
// dependencies, and the only Markdown we render is our own newsletter
// transcriptions — headings, paragraphs, emphasis, links, lists. A dependency
// buys nothing here and adds an upgrade path nobody at BLPAPA can maintain.
//
// It deliberately supports a subset. If a future newsletter needs tables or
// footnotes, extend this file rather than reaching for a package.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ESCAPES[c]);

/** Split YAML-ish front matter off the top of a Markdown file. */
export function parseFrontMatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: source };

  const data = {};
  let key = null;
  let folded = false;

  for (const line of match[1].split(/\r?\n/)) {
    // A folded scalar (`summary: >-`) continues across indented lines.
    if (folded) {
      if (/^\s+\S/.test(line)) {
        data[key] = (data[key] ? data[key] + ' ' : '') + line.trim();
        continue;
      }
      folded = false;
    }
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    key = kv[1];
    const value = kv[2].trim();
    if (value === '>-' || value === '>' || value === '|') {
      folded = true;
      data[key] = '';
    } else {
      data[key] = value.replace(/^["'](.*)["']$/, '$1');
    }
  }
  return { data, body: source.slice(match[0].length) };
}

/** Inline spans: code, bold, italic, links, autolinks. */
function inline(text) {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  // [label](href)
  out = out.replace(
    /\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
    (_, label, href) => `<a href="${href}">${label}</a>`,
  );
  // <https://autolink>  — the angle brackets are already escaped by now.
  out = out.replace(
    /&lt;(https?:\/\/[^\s&]+)&gt;/g,
    (_, href) => `<a href="${href}">${href}</a>`,
  );
  return out;
}

/** Render a Markdown subset to HTML. */
export function renderMarkdown(source) {
  const lines = source.split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let listType = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };
  const flush = () => {
    flushParagraph();
    flushList();
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    // Pass HTML comments straight through. Transcription notes (such as the
    // flagged "BDOG if May 7" typo) are meant to survive into the built page.
    if (/^\s*<!--/.test(line)) {
      flush();
      const block = [line];
      while (!/-->/.test(block[block.length - 1]) && i + 1 < lines.length) {
        i += 1;
        block.push(lines[i]);
      }
      html.push(block.join('\n'));
      continue;
    }

    if (!line.trim()) {
      flush();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flush();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2].trim())}</h${level}>`);
      continue;
    }

    if (/^(\*\s*){3,}$|^(-\s*){3,}$/.test(line.trim())) {
      flush();
      html.push('<hr>');
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (bullet || ordered) {
      flushParagraph();
      const wanted = bullet ? 'ul' : 'ol';
      if (listType !== wanted) {
        flushList();
        listType = wanted;
        html.push(`<${wanted}>`);
      }
      html.push(`<li>${inline((bullet || ordered)[1])}</li>`);
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flush();
      html.push(`<blockquote><p>${inline(quote[1])}</p></blockquote>`);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flush();
  return html.join('\n');
}
