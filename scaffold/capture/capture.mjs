// Pilote la source et produit les captures listées dans script-breakdown.md (section « Captures à produire »).
// L'agent remplit ce fichier : un appel shot() par capture, dans l'ordre du breakdown. Modèle :
//   - artifact / HTML local : page.goto('file://' + root + cfg.capture.source), fonctions globales du proto dans `setup`
//   - URL live : page.goto(cfg.capture.source) après `npm run login` (profil Chrome persistant, cfg.capture.profileDir)
import {launch, prepare, shot, save, root, cfg, sleep} from './lib.mjs';

const {browser, page} = await launch({headless: true});
const url = /^https?:/.test(cfg.capture.source) ? cfg.capture.source : 'file://' + root + cfg.capture.source;
await page.goto(url, {waitUntil: 'networkidle2'}); await sleep(1600); // webfonts
await prepare(page, {
  hide: [], // sélecteurs de contrôles de prototype à masquer (ex. '#proto-bar', '.toast-zone'). Masquer, jamais réécrire.
  css: '',
});

// ---- Captures (une par ligne du tableau « Captures à produire ») ----
// await shot(page, 'home', `window.setState && setState('home')`, {
//   sidebarItem: "document.querySelector('.sb-item[data-nav=home]')",
//   title: "__byText(null, 'h1', 'Mon titre')",
// });
// await shot(page, 'detail', async (p) => { await p.click('.row:nth-child(2)'); await sleep(300); }, {panel: "document.querySelector('.panel')"}, {height: 1200});

save();
await browser.close();
