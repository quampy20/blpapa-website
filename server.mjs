#!/usr/bin/env node
// Local preview server for dist/. Development only — Netlify serves the built
// site in production. Kept dependency-free like the rest of the toolchain.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const PORT = Number(process.env.PORT ?? 8080);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let target = path.join(DIST, url);
  if (!target.startsWith(DIST)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
  } catch {
    target = path.join(DIST, '404.html');
  }
  try {
    const body = await readFile(target);
    res.writeHead(target.endsWith('404.html') ? 404 : 200, {
      'Content-Type': TYPES[path.extname(target)] ?? 'application/octet-stream',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}`));
