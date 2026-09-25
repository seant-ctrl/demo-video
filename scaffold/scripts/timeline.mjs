// Sort la timeline réelle (durées MP3 mesurées + chorégraphie) en JSON : c'est la source des timecodes des livrables markdown.
import {makeBeats} from '../src/scenes/beats.mjs';
import {makeData} from '../src/data.mjs';
import {TEXTS} from '../src/texts.mjs';
import {DEMO} from '../src/demo.mjs';
const OVERLAP = 8, TRANSITION = 12, TAIL = 20;
const FPS = DEMO.fps ?? 30;
const d = makeData(DEMO.lang), B = makeBeats(d, TEXTS[DEMO.lang] ?? TEXTS.fr);
const dur = (b) => Math.max(b.min, d.voFrames(b.voId) + (b.tail ?? TAIL));
const title = DEMO.titleCard ? (d.hasVO(DEMO.title.voId) ? d.voFrames(DEMO.title.voId) + (DEMO.title.tail ?? 60) : 105) : 0;
const outro = DEMO.outroCard ? (d.hasVO(DEMO.outro.voId) ? d.voFrames(DEMO.outro.voId) + (DEMO.outro.tail ?? 15) : 120) : 0;
const seg = B.length ? B.reduce((a, b) => a + dur(b), 0) - OVERLAP * (B.length - 1) : 0;
const total = title + seg + outro - (title ? TRANSITION : 0) - (outro ? TRANSITION : 0);
const rows = [];
if (title) rows.push({id: 'P00-titre', voId: DEMO.title.voId, frames: title});
for (const b of B) rows.push({id: b.id, voId: b.voId, frames: dur(b)});
if (outro) rows.push({id: `P${String(rows.length).padStart(2, '0')}-outro`, voId: DEMO.outro.voId, frames: outro});
let t = 0;
for (const r of rows) {
  r.start = t; r.startTc = `${Math.floor(t / FPS / 60)}:${String((t / FPS % 60).toFixed(1)).padStart(4, '0')}`;
  r.voSeconds = d.voSeconds(r.voId); r.voFrames = d.voFrames(r.voId);
  r.seconds = r.frames / FPS; r.silence = (r.frames - r.voFrames) / FPS;
  r.driver = r.voFrames && r.frames === r.voFrames + TAIL ? 'audio' : 'choreo';
  t += r.frames - (r.id.endsWith('-titre') || r.id.endsWith('-outro') ? TRANSITION : OVERLAP);
}
console.log(JSON.stringify({total, totalSeconds: total / FPS, window: DEMO.window, rows}, null, 1));
