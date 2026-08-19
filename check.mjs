#!/usr/bin/env node
// Pre-flight checks over dist/. This is CLAUDE.md §8's "definition of done"
// turned into something that fails a build instead of relying on memory.
//
// It cannot judge copy or verify a fact — those stay human jobs. It does catch
// the mechanical failures: a page over budget, a missing alt attribute, a
// heading level skipped, a broken internal link, a mangled Google Form URL.

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const PAGE_BUDGET = 500 * 1024;

// Canonical intake URLs. These must survive byte-for-byte wherever they appear
// (CLAUDE.md §5.2) — a typo here is a vendor who never got registered.
const CANONICAL_FORMS = [
  'https://forms.gle/kouXfBpNwrdLDqUp8',
  'https://docs.google.com/forms/d/e/1FAIpQLSfeuSqK6Pfrc1bgEM8wTu8KkPxBQAUzUlV_B38VhUUs3sC7iw/viewform?usp=sharing',
  'https://forms.gle/5qUU2HFtGZH783Cg8',
  'https://forms.gle/rj6jPf3qSvStGwEN6',
  'https://drive.google.com/file/d/1b7yoeVSQmDcZZIykRFB16kGrt27jtc8r/view?usp=drive_link',
];

const problems = [];
const notes = [];
const fail = (page, message) => problems.push(`${page}: ${message}`);

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

const sizeOf = async (file) => (await stat(path.join(DIST, file)).catch(() => ({ size: 0 }))).size;

// Self-hosted webfonts are a fixed cost on every page: between headings, body,
// bold, and card titles, a typical page touches all four faces. Counting the
// whole set keeps the budget honest rather than flattering.
let fontTotal = null;
async function fontBytes() {
  if (fontTotal === null) {
    fontTotal = 0;
    for (const file of await walk(path.join(DIST, 'assets', 'fonts'))) {
      fontTotal += await sizeOf(path.join('assets', 'fonts', file));
    }
  }
  return fontTotal;
}

/** Strip comments and script/style bodies before inspecting markup. */
const stripped = (html) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

async function checkPage(file, allFiles) {
  const page = '/' + file.replace(/index\.html$/, '');
  const raw = await readFile(path.join(DIST, file), 'utf8');
  const html = stripped(raw);

  // -- One <h1>, and heading levels that descend without skipping.
  const headings = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  const h1s = headings.filter((h) => h === 1).length;
  if (h1s !== 1) fail(page, `expected exactly one <h1>, found ${h1s}`);
  for (let i = 1; i < headings.length; i += 1) {
    if (headings[i] > headings[i - 1] + 1) {
      fail(page, `heading jumps from h${headings[i - 1]} to h${headings[i]}`);
    }
  }

  // -- Every <img> carries an alt attribute (empty is fine when decorative).
  for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=/.test(tag)) fail(page, `<img> without alt: ${tag.slice(0, 90)}`);
  }

  // -- Interactive elements need an accessible name.
  for (const [tag, inner] of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const text = inner.replace(/<[^>]+>/g, '').trim();
    if (!text && !/aria-label=|aria-labelledby=/.test(tag)) {
      fail(page, `link with no accessible name: ${tag.slice(0, 90)}`);
    }
  }

  // -- Focus states are never removed (CLAUDE.md §6).
  if (/outline:\s*none/i.test(raw)) fail(page, 'inline `outline: none` found');

  // -- Page weight: HTML + shared CSS/JS + webfonts + the images it references.
  let bytes = Buffer.byteLength(raw);
  bytes += await sizeOf('styles/site.css');
  bytes += await sizeOf('scripts/nav.js');
  bytes += await fontBytes();
  for (const [, src] of raw.matchAll(/<script[^>]+src="\/scripts\/([^"]+)"/g)) {
    bytes += await sizeOf(`scripts/${src}`);
  }
  // A <picture> offers WebP and JPEG, and a srcset offers 1x and 2x, but the
  // browser downloads exactly one of each group. Group by the path with the
  // extension and any @Nx size suffix removed, then count the heaviest
  // candidate in each group — the honest worst case for one visitor.
  const groups = new Map();
  for (const [, attr] of raw.matchAll(/(?:src|srcset)="([^"]*\/assets\/[^"]*)"/g)) {
    for (const candidate of attr.split(',')) {
      const url = candidate.trim().split(/\s+/)[0];
      if (!url.startsWith('/assets/')) continue;
      const key = url.replace(/-\d+(?=\.[a-z]+$)/, '').replace(/\.[a-z]+$/, '');
      const size = await sizeOf(url.replace(/^\//, ''));
      groups.set(key, Math.max(groups.get(key) ?? 0, size));
    }
  }
  for (const size of groups.values()) bytes += size;
  if (bytes > PAGE_BUDGET) {
    fail(page, `weighs ${(bytes / 1024).toFixed(0)} KB, over the ${PAGE_BUDGET / 1024} KB budget`);
  } else {
    notes.push(`${page} — ${(bytes / 1024).toFixed(0)} KB`);
  }

  // -- Internal links resolve to something the build actually emitted.
  for (const [, href] of raw.matchAll(/href="(\/[^"#?]*)/g)) {
    const target = href.replace(/^\//, '');
    const candidates = [target, path.join(target, 'index.html')].map((c) => c.replace(/\/$/, ''));
    const exists = allFiles.some((f) => candidates.includes(f) || f === `${target}index.html`);
    if (!exists) fail(page, `internal link 404s: ${href}`);
  }

  // -- Google Form links, where present, match the canonical strings exactly.
  for (const [, href] of raw.matchAll(/href="(https:\/\/(?:forms\.gle|docs\.google\.com\/forms|drive\.google\.com)[^"]*)"/g)) {
    if (!CANONICAL_FORMS.includes(href)) {
      fail(page, `non-canonical Google URL: ${href}`);
    }
  }

  // -- No tracking, analytics, or social SDKs (CLAUDE.md §2).
  for (const pattern of [/googletagmanager/i, /google-analytics/i, /recaptcha/i, /facebook\.net/i, /connect\.facebook/i]) {
    if (pattern.test(raw)) fail(page, `third-party script matching ${pattern} — banned by CLAUDE.md §2`);
  }

  // -- Lorem Ipsum is banned outright (CLAUDE.md §5.4).
  if (/lorem ipsum/i.test(raw)) fail(page, 'Lorem Ipsum found');
}

const files = await walk(DIST);
const pages = files.filter((f) => f.endsWith('.html') && !f.startsWith('admin'));

for (const file of pages) await checkPage(file, files);

console.log(`Checked ${pages.length} pages.\n`);
console.log(notes.sort().join('\n'));

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n` + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
console.log('\nAll checks passed.');
