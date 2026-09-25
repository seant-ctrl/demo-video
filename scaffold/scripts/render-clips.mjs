// Rend chaque plan comme un clip autonome (H.264, 1920x1080), l'unité que Framewave manipule.
// Un seul bundle pour tous les rendus. Sortie : out/clips/NN-<plan>.mp4 + out/clips/clips.json.
import {bundle} from '@remotion/bundler';
import {renderMedia, getCompositions} from '@remotion/renderer';
import path from 'node:path'; import fs from 'node:fs'; import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const out = path.join(root, 'out/clips'); fs.mkdirSync(out, {recursive: true});
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',');
console.log('bundling…');
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), onProgress: () => {}});
const comps = (await getCompositions(serveUrl)).filter((c) => c.id.startsWith('Clip-'));
// L'ordre est celui de Root.tsx (index dans defaultProps), pas l'ordre alphabétique.
comps.sort((a, b) => (a.defaultProps?.index ?? 0) - (b.defaultProps?.index ?? 0));
console.log(comps.length, 'clips à rendre');
const indexPath = path.join(out, 'clips.json');
const prev = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, 'utf8')) : [];
const index = [];
for (let i = 0; i < comps.length; i++) {
  const c = comps[i];
  const plan = c.id.replace('Clip-', '');
  const file = `${String(i).padStart(2, '0')}-${plan}.mp4`;
  const ms = (c.durationInFrames / c.fps) * 1000;
  if (only && !only.includes(plan)) { const p = prev.find((x) => x.plan === plan); if (p) index.push(p); continue; }
  process.stdout.write(`  ${file} … `);
  await renderMedia({composition: c, serveUrl, codec: 'h264', crf: 18, outputLocation: path.join(out, file), onProgress: () => {}});
  index.push({plan, file, frames: c.durationInFrames, durationMs: ms, kind: plan.endsWith('-titre') ? 'title' : plan.endsWith('-outro') ? 'outro' : 'beat'});
  console.log(`${(ms / 1000).toFixed(2)}s`);
}
fs.writeFileSync(indexPath, JSON.stringify(index, null, 1));
console.log('DONE', index.length, 'clips ·', (index.reduce((a, b) => a + b.durationMs, 0) / 1000).toFixed(1), 's cumulées');
