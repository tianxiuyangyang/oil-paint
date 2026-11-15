// Loads the built demo headless the way a first visit does (no ?capture) and reports what the page said while it
// started: every console message, page error and failed request, the loading text over time, and the timings.
//   node tools/diag-load.mjs [--dist dist] [--query ""] [--timeout 90000] [--url http://127.0.0.1:5405/] [--nogl]
//                           [--shot shots/work/diag.png]
// --url loads a server already running instead of serving dist/ here; --nogl hides WebGL2, to see what a browser
// without it says; --shot saves a screenshot once the picture is up.
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { guard } from './no-pointer-lock.mjs';

guard(chromium);
const here = resolve(fileURLToPath(import.meta.url), '..', '..');
const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : fallback; };
const root = resolve(here, flag('dist', 'dist'));
const timeout = Number(flag('timeout', 90000));
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.jpg': 'image/jpeg', '.png': 'image/png',
};
const server = createServer((req, res) => {
  let file = normalize(join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!file.startsWith(root) || !existsSync(file)) return void res.writeHead(404).end('not found');
  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
  createReadStream(file).pipe(res);
});
if (!flag('url')) await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = flag('url') ? `${flag('url').replace(/\?.*$/, '')}?nopad&${flag('query', '')}` : `http://127.0.0.1:${server.address().port}/?nopad&${flag('query', '')}`;
console.log('url', url);

const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  headless: true,
  args: ['--mute-audio', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--enable-gpu'],
});
const started = Date.now();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  if (args.includes('--nogl')) {
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
        return /webgl2/.test(String(type)) ? null : get.call(this, type, ...rest);
      };
    });
  }
  page.on('console', (m) => console.log(`console.${m.type()}:`, m.text().slice(0, 400)));
  page.on('pageerror', (e) => console.log('pageerror:', e.message));
  page.on('requestfailed', (r) => console.log('requestfailed:', r.url().slice(0, 200), r.failure()?.errorText));
  page.on('response', (r) => { if (r.status() >= 400) console.log('http', r.status(), r.url().slice(0, 200)); });
  await page.goto(url);
  let last = '';
  const ticker = setInterval(async () => {
    const s = await page.evaluate(() => {
      const el = document.getElementById('loading');
      return {
        t: performance.now() | 0,
        loading: el ? el.textContent.trim() : null,
        ready: !!window.lab?.ready,
        canvas: !!document.querySelector('#view canvas'),
      };
    }).catch(() => null);
    const now = s ? `${(s.t / 1000).toFixed(1)}s loading=${JSON.stringify(s.loading)} ready=${s.ready} canvas=${s.canvas}` : 'page gone';
    if (now !== last) { console.log('state', now); last = now; }
  }, 1000);
  const ok = await page.waitForFunction(() => window.lab?.ready, null, { timeout }).then(() => true, () => false);
  clearInterval(ticker);
  const info = await page.evaluate(() => ({
    ready: !!window.lab?.ready,
    loading: document.getElementById('loading')?.textContent ?? null,
    canvas: !!document.querySelector('#view canvas'),
    gl: (() => { const c = document.querySelector('#view canvas'); const gl = c?.getContext('webgl2'); return gl ? gl.getParameter(gl.VERSION) : 'no webgl2 ctx'; })(),
    timings: window.lab?.timings,
    renderer: window.lab?.renderer?.info ? { calls: window.lab.renderer.info.render.calls, triangles: window.lab.renderer.info.render.triangles } : null,
  })).catch((e) => ({ error: String(e) }));
  console.log(`\nRESULT after ${((Date.now() - started) / 1000).toFixed(1)}s:`, ok ? 'READY' : 'NOT READY');
  console.log(JSON.stringify(info, null, 2));
  if (ok && flag('shot')) {
    await page.waitForTimeout(1500);
    const shot = resolve(here, flag('shot'));
    await page.screenshot({ path: shot });
    console.log('screenshot', shot);
  }
  if (!ok) process.exitCode = 2;
} finally {
  await browser.close();
  if (server.listening) server.close();
}