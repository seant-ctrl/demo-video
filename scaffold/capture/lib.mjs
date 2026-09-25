// Harnais de capture partagé (artifact local, URL live, HTML quelconque) : Chrome headless via puppeteer-core.
// Écrit public/shots/<id>.png (cssWidth × N css @dpr) + manifest.json des rects cibles en px css.
// Règle absolue : on ne réécrit AUCUN texte de la source. On masque (CSS) ; on ne remplace pas.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
export const root = fileURLToPath(new URL('..', import.meta.url));
export const cfg = JSON.parse(fs.readFileSync(root + 'demo.config.json', 'utf8'));
const cap = cfg.capture ?? {};
export const CSS_W = cap.cssWidth ?? 1600, DPR = cap.dpr ?? 2, DEF_H = cap.defaultHeight ?? 900;
export const OUT = root + 'public/shots'; fs.mkdirSync(OUT, {recursive: true});
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const manifest = {};

export async function launch({headless = true} = {}) {
  const profile = cap.profileDir ? cap.profileDir.replace(/^~/, os.homedir()) : null;
  const browser = await puppeteer.launch({
    executablePath: cap.chrome ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless, userDataDir: profile ?? undefined,
    args: ['--no-sandbox', '--allow-file-access-from-files', '--hide-scrollbars', '--font-render-hinting=none', `--window-size=${CSS_W},${DEF_H + 120}`],
  });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGEERR', e.message));
  await page.setViewport({width: CSS_W, height: DEF_H, deviceScaleFactor: DPR});
  return {browser, page};
}

// Helpers injectés une fois par page : rects, recherche par texte, union, scroll, masque, gel des animations.
export async function prepare(page, {hide = [], css = ''} = {}) {
  await page.evaluate((hide, css) => {
    const st = document.createElement('style');
    st.id = '__dv_style';
    st.textContent = '*{transition:none!important;animation:none!important;caret-color:transparent!important}' + (hide.length ? hide.join(',') + '{visibility:hidden!important}' : '') + css;
    document.head.appendChild(st);
    window.__rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return {x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1)}; };
    window.__byText = (rootSel, sel, txt) => { const r = rootSel ? document.querySelector(rootSel) : document; if (!r) return null; const all = [...r.querySelectorAll(sel)].filter((e) => e.textContent.trim().includes(txt) && e.getBoundingClientRect().width > 0); if (!all.length) return null; return all.reduce((a, b) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return rb.width * rb.height < ra.width * ra.height ? b : a; }); };
    window.__union = (...els) => { const rs = els.filter(Boolean).map((e) => e.getBoundingClientRect()); if (!rs.length) return null; const x = Math.min(...rs.map((r) => r.left)), y = Math.min(...rs.map((r) => r.top)), X = Math.max(...rs.map((r) => r.right)), Y = Math.max(...rs.map((r) => r.bottom)); return {getBoundingClientRect: () => ({x, y, width: X - x, height: Y - y})}; };
    window.__into = (sel, block = 'center') => { const e = document.querySelector(sel); if (e) e.scrollIntoView({block, behavior: 'instant'}); };
    window.__nth = (sel, i) => document.querySelectorAll(sel)[i];
  }, hide, css);
}

// Une capture : id, setup (code JS exécuté dans la page, ou fonction async(page)), rects {clé: expression JS → élément}, options.
export async function shot(page, id, setup, rects = {}, {wait = 420, height = DEF_H} = {}) {
  await page.setViewport({width: CSS_W, height, deviceScaleFactor: DPR});
  if (typeof setup === 'function') await setup(page);
  else if (setup) await page.evaluate('(()=>{' + setup + '})()');
  await sleep(wait);
  const r = await page.evaluate((rects) => { const o = {}; for (const [k, expr] of Object.entries(rects)) { try { o[k] = window.__rect(eval(expr)); } catch (e) { o[k] = null; } } o.viewport = {w: innerWidth, h: innerHeight}; return o; }, rects);
  await page.screenshot({path: `${OUT}/${id}.png`});
  manifest[id] = r;
  const nulls = Object.entries(r).filter(([, v]) => v === null).map(([k]) => k);
  console.log(id.padEnd(26), String(height).padStart(4), nulls.length ? 'NULL: ' + nulls.join(',') : 'ok');
  return r;
}

export function save() {
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
  const nulls = Object.entries(manifest).flatMap(([id, r]) => Object.entries(r).filter(([k, v]) => v === null && k !== 'viewport').map(([k]) => id + '.' + k));
  console.log(Object.keys(manifest).length, 'shots →', OUT, nulls.length ? `\nRECTS MANQUANTS (${nulls.length}) : ` + nulls.join(', ') : '');
  if (nulls.length) process.exitCode = 1;
}
