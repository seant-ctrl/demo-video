// EXEMPLE — pilotage d'un prototype HTML local, à copier dans capture.mjs et adapter.
// Le proto fictif expose des fonctions globales d'état : setRole(id), gotoScene(id), openModal(id).
// Règle : on masque les contrôles de prototype (CSS), on ne réécrit jamais un texte.
import {launch, prepare, shot, save, root, sleep} from './lib.mjs';

const {browser, page} = await launch({headless: true});
await page.goto('file://' + root + 'capture/proto.html', {waitUntil: 'load'});
await sleep(1600); // webfonts
await prepare(page, {hide: ['#proto-bar', '.toast-zone', '#lang-switch']});

// Remettre le proto dans un état connu avant chaque série
await page.evaluate(() => { localStorage.clear(); window.setRole?.('manager', true); });

// 1 · Page d'accueil du module : l'entrée de sidebar, les onglets, la grille
await shot(page, 'home', `gotoScene('home')`, {
  sidebarItem: "document.querySelector('.sb-item[data-nav=module]')",
  tabs: "document.querySelector('.tabs')",
  grid: "__union(...[...document.querySelectorAll('.card')].slice(0, 4))",
  card1: "__nth('.card', 0)",
});

// 2 · Détail d'un élément, capture plus haute pour garder deux blocs cités dans un même plan
await shot(page, 'detail', `gotoScene('detail'); __into('#steps', 'start')`, {
  hero: "document.querySelector('.hero')",
  steps: "document.querySelector('#steps')",
  cta: "__byText(null, 'button', 'Demander')",
}, {height: 1200});

// 3 · Même écran après une action : un état = un shot, jamais une animation capturée
await shot(page, 'detail-sent', `gotoScene('detail'); openModal('request'); document.querySelector('#request-send').click()`, {
  badge: "__byText('.hero', '.badge', 'envoyée')",
  toast: "document.getElementById('toast')",
}, {wait: 600});

save();
await browser.close();
