// Lance Framewave. Le projet créé par framewave-project.mjs est le plus récent : il apparaît en tête de l'écran Home.
// (Framewave n'a pas de deep link / argument CLI d'ouverture de projet : l'utilisateur clique la première vignette.)
import fs from 'node:fs'; import {execSync} from 'node:child_process'; import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const info = fs.existsSync(root + 'out/framewave-project.json') ? JSON.parse(fs.readFileSync(root + 'out/framewave-project.json', 'utf8')) : null;
const app = ['/Applications/Framewave.app', `${process.env.HOME}/Applications/Framewave.app`].find((p) => fs.existsSync(p));
if (!app) {
  console.error('Framewave n\'est pas installé. Télécharge le .dmg : https://github.com/seant-ctrl/framewave/releases/latest (Apple Silicon : -arm64.dmg).');
  console.error('Premier lancement : clic droit → Ouvrir, ou `xattr -cr /Applications/Framewave.app` si macOS dit que l\'app est endommagée.');
  process.exit(1);
}
execSync(`open -a "${app}"`);
console.log('Framewave lancé.', info ? `Projet « ${info.name} » (${(info.totalMs / 1000).toFixed(1)} s, ${info.clips} plans) en tête de la liste Home → clique dessus.` : '');
if (info) console.log('Dossier :', info.dir);
