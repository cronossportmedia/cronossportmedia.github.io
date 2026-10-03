/**
 * dev-server.js
 * Servidor estático local para probar el sitio antes de hacer push.
 * Sin dependencias. Uso: npm run dev  →  http://localhost:5510
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.env.PORT) || 5510;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.xml':  'application/xml',
  '.txt':  'text/plain; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico':  'image/x-icon',
};

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);
  let file = normalize(join(ROOT, decodeURIComponent(pathname)));
  if (file !== ROOT && !file.startsWith(ROOT + sep)) { res.writeHead(403).end(); return; }

  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
  } catch {
    // GitHub Pages sirve /noticias como /noticias.html
    if (!extname(file)) file += '.html';
  }

  try {
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 — no encontrado');
  }
}).on('error', (err) => {
  // No tomar otro puerto en silencio: puede haber otra app local (p. ej. Finanzas Personales)
  if (err.code === 'EADDRINUSE') {
    console.error(`Puerto ${PORT} ocupado. Usa otro: PORT=5511 npm run dev`);
    process.exit(1);
  }
  throw err;
}).listen(PORT, () => {
  console.log(`Crono Play dev server → http://localhost:${PORT}`);
});
