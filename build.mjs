#!/usr/bin/env node
// BLPAPA site build: src/pages + content/ -> dist/
//
// Zero runtime and zero build dependencies by design (CLAUDE.md §2). The whole
// toolchain is this file, lib/markdown.mjs, and Node itself, so the site still
// builds in five years without an npm install resolving.

import { readFile, writeFile, mkdir, readdir, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMarkdown, parseFrontMatter } from './lib/markdown.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const CONTENT = path.join(ROOT, 'content');
const SITE_URL = 'https://blpapa.com';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ESCAPES[c]);
const lookup = (data, key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), data);

/** Recursively list files under `dir`, returned as paths relative to `dir`. */
async function walk(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full, base)));
    else files.push(path.relative(base, full));
  }
  return files;
}

// -- Templating -------------------------------------------------------------
// {{> partial }} includes, {{ value }} escapes, {{{ value }}} does not.
// An unknown name throws: a typo should fail the build, not ship a blank page.

function expandPartials(template, partials) {
  let out = template;
  for (let depth = 0; depth < 8 && out.includes('{{>'); depth += 1) {
    out = out.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
      if (!(name in partials)) throw new Error(`Unknown partial: {{> ${name} }}`);
      return partials[name];
    });
  }
  return out;
}

function substitute(template, data) {
  return template
    .replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, key) => {
      const value = lookup(data, key);
      if (value === undefined) throw new Error(`Unknown template value: {{{ ${key} }}}`);
      return value;
    })
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
      const value = lookup(data, key);
      if (value === undefined) throw new Error(`Unknown template value: {{ ${key} }}`);
      return esc(value);
    });
}

const render = (template, data, partials) => substitute(expandPartials(template, partials), data);

/** Page front matter, written as a leading `<!--meta ... -->` block. */
function parseMeta(source) {
  const match = source.match(/^<!--meta\r?\n([\s\S]*?)-->\r?\n?/);
  if (!match) return [{}, source];
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^\s*([\w-]+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return [meta, source.slice(match[0].length)];
}

// -- Derived values ---------------------------------------------------------

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatEventDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return {
    long: `${DAYS[date.getUTCDay()]}, ${MONTHS[m - 1]} ${d}, ${y}`,
    short: `${MONTHS[m - 1].slice(0, 3)} ${d}`,
    month: MONTHS[m - 1].slice(0, 3).toUpperCase(),
    day: String(d),
    year: String(y),
  };
}

const to12Hour = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
};

/** Nav list, in the fixed order from site.json. Donate keeps its slot in that
 *  order but renders as a button — visually distinct, per CLAUDE.md §4. */
function navMarkup(site, current) {
  return site.nav
    .map(({ label, url }) => {
      const isCurrent = url === current;
      const cls = ['site-nav__link'];
      if (url === '/donate/') cls.push('site-nav__link--donate');
      if (isCurrent) cls.push('is-current');
      return `<li class="site-nav__item">`
        + `<a class="${cls.join(' ')}" href="${url}"${isCurrent ? ' aria-current="page"' : ''}>`
        + `${esc(label)}</a></li>`;
    })
    .join('\n            ');
}

// -- Build ------------------------------------------------------------------

async function main() {
  const site = JSON.parse(await readFile(path.join(CONTENT, 'site.json'), 'utf8'));
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  const partials = {};
  for (const file of await walk(path.join(SRC, 'partials'))) {
    if (file.endsWith('.html')) {
      partials[path.basename(file, '.html')] = await readFile(path.join(SRC, 'partials', file), 'utf8');
    }
  }
  const layout = partials.layout;
  const event = site.nextEvent;
  const eventDate = formatEventDate(event.date);

  const base = {
    site,
    year: String(new Date().getFullYear()),
    event: {
      ...event,
      dateLong: eventDate.long,
      dateShort: eventDate.short,
      dateMonth: eventDate.month,
      dateDay: eventDate.day,
      dateYear: eventDate.year,
      timeRange: `${to12Hour(event.startTime)}–${to12Hour(event.endTime)}`,
    },
    // Present on every page so the layout and partials always resolve.
    bodyClass: '',
    pageScripts: '',
    ogImage: `${SITE_URL}/assets/logo/social-card.png`,
  };

  const routes = [];
  const pageFiles = (await walk(path.join(SRC, 'pages'))).filter((f) => f.endsWith('.html'));

  for (const file of pageFiles) {
    const source = await readFile(path.join(SRC, 'pages', file), 'utf8');
    const [meta, body] = parseMeta(source);
    const route = meta.route ?? `/${file.replace(/index\.html$/, '').replace(/\.html$/, '/')}`;
    const data = {
      ...base,
      ...meta,
      canonical: `${SITE_URL}${route}`,
      nav: navMarkup(site, meta.nav ?? route),
      bodyClass: meta.bodyClass ?? '',
      // `script: forms` in a page's meta block loads /scripts/forms.js there
      // and nowhere else, so pages that need no behaviour ship no behaviour.
      pageScripts: meta.script
        ? `<script type="module" src="/scripts/${meta.script}.js"></script>`
        : '',
    };
    data.content = render(body, data, partials);
    await writePage(route, render(layout, data, partials), meta.sitemap !== 'false' && routes);
  }

  // Newsletters: one Markdown file per issue -> one real HTML page (CLAUDE.md §5.3).
  const newsletterTemplate = await readFile(path.join(SRC, 'templates', 'newsletter.html'), 'utf8');
  for (const file of await walk(path.join(CONTENT, 'newsletters'))) {
    if (!file.endsWith('.md')) continue;
    const { data: front, body } = parseFrontMatter(
      await readFile(path.join(CONTENT, 'newsletters', file), 'utf8'),
    );
    const route = `/culture/newsletter/${front.slug}/`;
    // The page hero supplies the <h1>, so drop the body's own leading `#`
    // title — it would otherwise print twice — and let its `##` sections
    // become the h2s directly beneath it.
    const article = renderMarkdown(body.replace(/^\s*#\s+.*\r?\n/, ''));
    const data = {
      ...base,
      ...front,
      title: `${front.title} — ${front.edition}, ${front.period}`,
      description: front.summary,
      canonical: `${SITE_URL}${route}`,
      nav: navMarkup(site, '/culture/'),
      article,
    };
    data.content = render(newsletterTemplate, data, partials);
    await writePage(route, render(layout, data, partials), routes);
  }

  // Static passthrough. Styles are concatenated so authoring stays modular
  // while the page pays for one request.
  await cp(path.join(SRC, 'assets'), path.join(DIST, 'assets'), { recursive: true });
  await cp(path.join(ROOT, 'admin'), path.join(DIST, 'admin'), { recursive: true });
  await mkdir(path.join(DIST, 'styles'), { recursive: true });
  await writeFile(path.join(DIST, 'styles', 'site.css'), await bundleStyles());
  await cp(path.join(SRC, 'scripts'), path.join(DIST, 'scripts'), { recursive: true });

  await writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap(routes));

  console.log(`Built ${routes.length} pages -> dist/`);
}

async function writePage(route, html, routes) {
  // A route ending in .html writes to that exact file rather than a directory
  // with an index — Netlify serves the error page from /404.html specifically.
  const target = route.endsWith('.html')
    ? path.join(DIST, route)
    : path.join(DIST, route === '/' ? '' : route, 'index.html');
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
  if (routes) routes.push(route);
}

async function bundleStyles() {
  const dir = path.join(SRC, 'styles');
  const files = await walk(dir);
  // Order matters: tokens define the custom properties everything else reads,
  // and the @font-face rules should land before anything asks for the family.
  const first = ['tokens.css', 'fonts.css', 'base.css', 'layout.css'];
  const rest = files.filter((f) => !first.includes(f) && f.endsWith('.css')).sort();
  const parts = [];
  for (const file of [...first, ...rest]) {
    parts.push(`/* ${file} */\n${await readFile(path.join(dir, file), 'utf8')}`);
  }
  return parts.join('\n');
}

function sitemap(routes) {
  const urls = routes
    .map((r) => `  <url><loc>${SITE_URL}${r}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

main().catch((error) => {
  console.error(`Build failed: ${error.message}`);
  process.exit(1);
});
