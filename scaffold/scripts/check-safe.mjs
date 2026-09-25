// QA automatique : zone de sécurité à chaque frame, zoom ≥ 1,5 sur le texte cité, plans ≥ 1,5 s, VO ≤ plan, durée dans la fenêtre.
// Usage : node scripts/check-safe.mjs   → exit 1 à la première violation. À lancer avant tout rendu.
import {makeBeats} from '../src/scenes/beats.mjs';
import {makeData, LANGS, FULL} from '../src/data.mjs';
import {TEXTS} from '../src/texts.mjs';
import {DEMO} from '../src/demo.mjs';
import {camAt, project, placeLabel, inSafe, SAFE} from '../src/cam.mjs';
const FPS = DEMO.fps ?? 30;
const OVERLAP = 8, TRANSITION = 12, TAIL = 20, MIN_TEXT_Z = 1.5, MIN_BEAT = Math.round(1.5 * FPS);
const FLAT = [{f: 0, cx: 960, cy: 540, z: 1}];
let failed = false;
for (const lang of LANGS) {
  console.log(`\n===== ${lang.toUpperCase()} =====`);
  const d = makeData(lang), BEATS = makeBeats(d, TEXTS[lang] ?? TEXTS.fr);
  if (!BEATS.length) { console.log('Aucun beat dans src/scenes/beats.mjs'); failed = true; continue; }
  const dur = (b) => Math.max(b.min, d.voFrames(b.voId) + (b.tail ?? TAIL));
  const planeH = (b) => Math.max(...b.shots.map((s) => d.plane(s.id).h));
  const title = DEMO.titleCard ? (d.hasVO(DEMO.title.voId) ? d.voFrames(DEMO.title.voId) + (DEMO.title.tail ?? 60) : 105) : 0;
  const outro = DEMO.outroCard ? (d.hasVO(DEMO.outro.voId) ? d.voFrames(DEMO.outro.voId) + (DEMO.outro.tail ?? 15) : 120) : 0;
  const seg = BEATS.reduce((a, b) => a + dur(b), 0) - OVERLAP * (BEATS.length - 1);
  const total = title + seg + outro - (title ? TRANSITION : 0) - (outro ? TRANSITION : 0);
  const viol = []; const seen = new Set();
  const rec = (b, f, what) => { const k = b.id + '|' + what.replace(/\(.*?\)|z=[0-9.]+/g, ''); if (seen.has(k)) return; seen.add(k); viol.push(`${b.id} f${f}: ${what}`); };
  let t = 0; const log = (n, dd, extra = '') => console.log(String(t).padStart(5), (t / FPS).toFixed(1).padStart(6) + 's', n.padEnd(18), String(dd).padStart(4) + 'f', extra);
  if (title) { log('Title', title); t += title - TRANSITION; }
  const ids = new Set();
  for (const b of BEATS) {
    if (ids.has(b.id)) rec(b, 0, 'id de plan dupliqué'); ids.add(b.id);
    const dd = dur(b), vo = d.voFrames(b.voId), ph = planeH(b);
    log(b.id, dd, vo ? `vo ${vo}f${dd === vo + TAIL ? ' (audio-driven)' : ' (choreo-driven)'}` : '(sans VO)');
    if (DEMO.voiceover && !vo) rec(b, 0, `pas de piste VO pour ${b.voId}`);
    if (dd < MIN_BEAT) rec(b, 0, `plan plus court que 1,5 s (${dd}f)`);
    if (vo + TAIL > dd) rec(b, 0, `VO (${vo}f) déborde du plan (${dd}f)`);
    if (!(b.subjects?.length) && !(b.hl?.length)) rec(b, 0, 'aucun subject / highlight déclaré');
    if (!b.shots?.length) rec(b, 0, 'aucun shot');
    for (const s of b.shots) if (s.at >= dd) rec(b, s.at, `shot ${s.id} commence après la fin du plan`);
    if ((b.hl ?? []).filter((h) => h.label).length > 3) rec(b, 0, 'plus de 3 pastilles dans un plan');
    const keys = DEMO.zooms === 'framewave' ? FLAT : b.cam;
    for (let f = 0; f < dd; f++) {
      const cam = camAt(keys, f, ph);
      for (const h of b.hl ?? []) {
        const to = h.to ?? dd - 1;
        if (f < h.from || f > to) continue;
        const p = project({x: h.r.x - 6, y: h.r.y - 6, w: h.r.w + 12, h: h.r.h + 12}, cam);
        if (!inSafe(p)) { rec(b, f, `highlight ${h.label ?? JSON.stringify(h.r)} hors zone de sécurité (${[p.x, p.y, p.x + p.w, p.y + p.h].map(Math.round)})`); break; }
        if (h.text !== false && DEMO.zooms !== 'framewave' && cam.z < MIN_TEXT_Z - 1e-6) { rec(b, f, `highlight ${h.label ?? 'box'} cité par la VO à zoom ${cam.z.toFixed(2)} < ${MIN_TEXT_Z} (déclare text:false si assumé)`); break; }
        if (h.label) { const L = placeLabel(p, h.side ?? 'bottom', h.label); if (!inSafe(L)) { rec(b, f, `pastille "${h.label}" ne tient pas dans la zone de sécurité`); break; } }
      }
      for (const s of b.subjects ?? []) {
        if (f < s.from || f > s.to) continue;
        if (DEMO.zooms === 'framewave' && s.r === FULL) continue; // plan à plat : le cadre entier EST la sortie, la zone de sécurité vaut pour les highlights seulement
        const p = project(s.r, cam);
        if (!inSafe(p)) { rec(b, f, `subject ${s.r === FULL ? 'FULL' : JSON.stringify(s.r)} hors zone de sécurité (${[p.x, p.y, p.x + p.w, p.y + p.h].map(Math.round)}) z=${cam.z.toFixed(2)}`); break; }
      }
    }
    for (const c of b.captions ?? []) { const capBottom = 1080 - 64, capTop = capBottom - 30 * 1.3 - 28; if (capTop < SAFE.y0 || capBottom > SAFE.y1) rec(b, c.from, 'légende hors zone de sécurité'); }
    t += dd - OVERLAP;
  }
  if (outro) { t = title + seg - (title ? TRANSITION : 0); log('Outro', outro); t += outro; }
  console.log('TOTAL', total, 'frames =', (total / FPS).toFixed(1), 's · fenêtre', DEMO.window?.join('–'), 's');
  if (d.MISSING.length) { console.log('MISSING RECTS:', [...new Set(d.MISSING)].join(', ')); viol.push('rects manquants dans public/shots/manifest.json'); }
  if (DEMO.window && (total < DEMO.window[0] * FPS || total > DEMO.window[1] * FPS)) viol.push(`durée totale ${(total / FPS).toFixed(1)}s hors fenêtre ${DEMO.window[0]}–${DEMO.window[1]} s`);
  if (viol.length) { console.log('\nVIOLATIONS (' + viol.length + ')'); viol.forEach((v) => console.log(' -', v)); failed = true; }
  else console.log('\nOK: 0 violations');
}
process.exit(failed ? 1 : 0);
