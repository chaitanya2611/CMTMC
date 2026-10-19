// usage: node capture.mjs <scene> <w> <h> <T> <outPrefix> (--stills t1,t2,... | --fps N)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
const require = createRequire('/opt/npm-tools/node_modules/');
const { chromium } = require('playwright');

const [scene, w, h, T, out] = process.argv.slice(2);
const stillsArg = process.argv.indexOf('--stills');
const fpsArg = process.argv.indexOf('--fps');
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const srv = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
}).listen(0);
const port = srv.address().port;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on('pageerror', (e) => console.error('PAGEERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
await page.goto(`http://localhost:${port}/studio.html?scene=${scene}&w=${w}&h=${h}&T=${T}`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
fs.mkdirSync(path.dirname(out), { recursive: true });
const save = async (t, file) => {
  const url = await page.evaluate((t) => { window.frame(t); return window.grab(); }, t);
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
};
const t0 = Date.now();
if (stillsArg > 0) {
  for (const t of process.argv[stillsArg + 1].split(',').map(Number)) await save(t, `${out}_t${t}.png`);
} else {
  const fps = +process.argv[fpsArg + 1] || 24; const n = Math.round(+T * fps);
  for (let i = 0; i < n; i++) {
    await save(i / fps, `${out}_${String(i).padStart(4, '0')}.png`);
    if (i % 48 === 0) console.log(`${scene} frame ${i}/${n} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
}
console.log(`${scene} done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
await browser.close(); srv.close();
