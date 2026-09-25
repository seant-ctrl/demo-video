// Ouvre Chrome (visible) sur la source live avec le profil persistant de demo.config.json → capture.profileDir,
// pour que l'utilisateur se connecte UNE fois. Les captures headless réutilisent ensuite la session.
// L'agent ne saisit jamais d'identifiants : c'est l'utilisateur qui tape, dans sa fenêtre.
import {launch, cfg, sleep} from './lib.mjs';
if (!cfg.capture.profileDir) { console.error('demo.config.json → capture.profileDir manquant (ex. "~/.demo-video/chrome-profile")'); process.exit(1); }
const {browser, page} = await launch({headless: false});
await page.goto(cfg.capture.source, {waitUntil: 'domcontentloaded'});
console.log('Connecte-toi dans la fenêtre Chrome, puis ferme-la (ou Ctrl+C ici) quand la page cible est visible.');
browser.on('disconnected', () => { console.log('Session enregistrée dans', cfg.capture.profileDir); process.exit(0); });
while (true) await sleep(1000);
