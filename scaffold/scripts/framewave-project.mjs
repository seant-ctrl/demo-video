// Construit un projet Framewave (mode montage) à partir des clips rendus, puis le dépose dans le dossier de projets de l'app.
// Se calque sur le project.json réel de Framewave (src/shared/types.ts) : mêmes clés, mêmes défauts que createMontage().
//   clips     → un clip vidéo par plan, transitions selon demo.config.json → framewave.transitions
//   audio     → VO en blocs audio indépendants (voTrack 'separate', défaut) ou déjà dans les clips ('baked')
//   captions  → sous-titres pré-remplis depuis le script VO, calés sur la durée mesurée de chaque MP3
//   markers   → un marqueur par plan
//   zooms     → vides en mode 'baked' (la caméra est dans l'image) ; segments éditables en mode 'framewave'
//   music     → framewave.music (chemin) copiée dans le projet, volume framewave.musicVolume, en boucle
// Usage : node scripts/framewave-project.mjs [--template <project.json existant>] [--name "Nom"]
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import {randomUUID} from 'node:crypto'; import {execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const arg = (k) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : null; };
const cfg = JSON.parse(fs.readFileSync(root + 'demo.config.json', 'utf8'));
const FW = cfg.framewave ?? {};
const FPS = cfg.fps ?? 30, W = cfg.width ?? 1920, H = cfg.height ?? 1080;
const home = os.homedir();
// Dossier de projets : env FRAMEWAVE_PROJECTS > settings.json de l'app > ~/Movies/Framewave (défaut macOS d'app.getPath('videos'))
const settingsPath = path.join(home, 'Library', 'Application Support', 'Framewave', 'settings.json');
let PROJECTS = process.env.FRAMEWAVE_PROJECTS || null;
if (!PROJECTS && fs.existsSync(settingsPath)) { try { PROJECTS = JSON.parse(fs.readFileSync(settingsPath, 'utf8')).projectsDir || null; } catch {} }
PROJECTS = PROJECTS || path.join(home, 'Movies', 'Framewave');
const NAME = arg('--name') || cfg.name || 'Démo';

const clips = JSON.parse(fs.readFileSync(path.join(root, 'out/clips/clips.json'), 'utf8'));
if (!clips.length) throw new Error('aucun clip rendu : lance npm run clips');
const voManifest = fs.existsSync(root + 'public/vo/manifest.json') ? JSON.parse(fs.readFileSync(root + 'public/vo/manifest.json', 'utf8')) : {};
const scriptPath = root + `voiceover/script-${cfg.lang ?? 'fr'}.json`;
const voScript = fs.existsSync(scriptPath) ? JSON.parse(fs.readFileSync(scriptPath, 'utf8')) : [];
const voText = Object.fromEntries(voScript.map((s) => [s.id, s.text]));

// Plan → voId : via la timeline réelle (même math que Video.tsx), pour ne pas dupliquer la convention de nommage.
const {makeBeats} = await import('../src/scenes/beats.mjs');
const {makeData} = await import('../src/data.mjs');
const {TEXTS} = await import('../src/texts.mjs');
const {DEMO} = await import('../src/demo.mjs');
const d = makeData(cfg.lang), beats = makeBeats(d, TEXTS[cfg.lang] ?? TEXTS.fr);
const beatById = Object.fromEntries(beats.map((b) => [b.id, b]));
const voIdOf = (plan) => plan.endsWith('-titre') ? DEMO.title?.voId : plan.endsWith('-outro') ? DEMO.outro?.voId : beatById[plan]?.voId;

// ---- dossier projet ----
const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const id = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}_${randomUUID().slice(0, 6)}`;
const dir = path.join(PROJECTS, id);
fs.mkdirSync(dir, {recursive: true});
const assetId = (i) => `m-${Date.now().toString(36)}${i}-${randomUUID().slice(0, 4)}`;

// ---- clips vidéo + placement (même math que placeClips() de Framewave : un clip avec transitionIn recouvre le précédent) ----
const TR = FW.transitions ?? {}; const trMs = TR.durationMs ?? 400;
const trFor = (i, c) => {
  if (i === 0) return undefined;
  const prev = clips[i - 1];
  let type = TR.default ?? 'cut';
  if (prev.kind === 'title' && TR.afterTitle) type = TR.afterTitle;
  if (c.kind === 'outro' && TR.beforeOutro) type = TR.beforeOutro;
  if (TR.byPlan && TR.byPlan[c.plan]) type = TR.byPlan[c.plan];
  return type === 'cut' ? undefined : {type, durationMs: trMs};
};
const media = [], timelineClips = [], placements = [];
let t = 0;
clips.forEach((c, i) => {
  const mid = assetId(i);
  const file = `${mid}-${c.plan}.mp4`;
  fs.copyFileSync(path.join(root, 'out/clips', c.file), path.join(dir, file));
  media.push({id: mid, kind: 'video', name: `${c.plan}.mp4`, file, width: W, height: H, durationMs: c.durationMs, hasAudio: true, codec: 'h264'});
  const transitionIn = trFor(i, c);
  const ov = transitionIn?.durationMs ?? 0;
  const start = Math.max(0, t - ov), end = start + c.durationMs;
  placements.push({plan: c.plan, start, end, voId: voIdOf(c.plan)});
  timelineClips.push({id: `clip-${i + 1}`, sourceId: mid, sourceStart: 0, sourceEnd: c.durationMs, speed: 1, fit: 'cover', ...(transitionIn ? {transitionIn} : {})});
  t = end;
});
const total = t;

// ---- VO : blocs audio indépendants (éditables : déplacer, couper, re-timer) ----
const audioClips = [];
if ((FW.voTrack ?? 'separate') === 'separate') {
  placements.forEach((p, i) => {
    const v = p.voId && voManifest[p.voId];
    if (!v) return;
    if (!fs.existsSync(path.join(root, 'public', v.file))) { console.warn(`VO manquante sur disque : ${v.file} (plan ${p.plan}) — bloc ignoré`); return; }
    const aid = assetId(100 + i);
    const file = `${aid}-${p.voId}.mp3`;
    fs.copyFileSync(path.join(root, 'public', v.file), path.join(dir, file));
    const ms = Math.round(v.seconds * 1000);
    media.push({id: aid, kind: 'audio', name: `${p.plan} · ${p.voId}.mp3`, file, durationMs: ms, hasAudio: true, codec: 'mp3'});
    // La voix démarre 4 frames après le début du plan : l'image s'installe avant la phrase.
    audioClips.push({id: `vo-${i + 1}`, sourceId: aid, sourceStart: 0, sourceEnd: ms, start: Math.round(p.start + (4 / FPS) * 1000), volume: 1, muted: false, fadeIn: 0, fadeOut: 0, name: `VO ${p.plan}`});
  });
}

// ---- Sous-titres : une ou plusieurs lignes par plan, découpées à la ponctuation, temps réparti au mot ----
const captions = [];
if (FW.captions !== false) {
  const MAX_WORDS = 12;
  placements.forEach((p, i) => {
    const text = p.voId && voText[p.voId]; const v = p.voId && voManifest[p.voId];
    if (!text || !v) return;
    const chunks = [];
    for (const sentence of text.split(/(?<=[.!?:;])\s+/)) {
      const w = sentence.trim().split(/\s+/); if (!w[0]) continue;
      for (let k = 0; k < w.length; k += MAX_WORDS) chunks.push(w.slice(k, k + MAX_WORDS).join(' '));
    }
    const words = chunks.reduce((a, c) => a + c.split(' ').length, 0);
    const voStart = audioClips.find((a) => a.name === `VO ${p.plan}`)?.start ?? p.start;
    let cur = voStart;
    chunks.forEach((c, k) => {
      const dur = (c.split(' ').length / words) * v.seconds * 1000;
      captions.push({id: `cap-${i + 1}-${k + 1}`, start: Math.round(cur), end: Math.round(Math.min(cur + dur, p.end)), text: c});
      cur += dur;
    });
  });
}

// ---- Zooms éditables (mode 'framewave' uniquement : les clips sont rendus à plat) ----
const zooms = [];
if (DEMO.zooms === 'framewave') {
  placements.forEach((p, i) => {
    const b = beatById[p.plan]; if (!b) return;
    const planeH = Math.max(...b.shots.map((s) => d.plane(s.id).h));
    let run = null;
    const flush = (endF) => { if (!run) return; zooms.push({id: `z-${zooms.length + 1}`, start: Math.round(p.start + (run.f0 / FPS) * 1000), end: Math.round(p.start + (endF / FPS) * 1000), focus: {x: run.cx / W, y: run.cy / planeH}, scale: run.z, origin: 'manual', followCursor: false}); run = null; };
    b.cam.forEach((k, j) => {
      if (k.z > 1.02) { if (!run) run = {f0: k.f, cx: k.cx, cy: k.cy, z: k.z}; else run.z = Math.max(run.z, k.z); }
      else flush(k.f);
    });
    flush(b.cam[b.cam.length - 1]?.f ?? 0);
  });
}

// ---- Musique de fond ----
let music = null;
if (FW.music) {
  const src = FW.music.replace(/^~/, home);
  if (fs.existsSync(src)) {
    const file = `${Date.now()}-${path.basename(src)}`;
    fs.copyFileSync(src, path.join(dir, file));
    let durationMs; try { durationMs = Math.round(parseFloat(execSync(`afinfo "${src}" | awk '/estimated duration/{print $3}'`).toString()) * 1000); } catch { try { durationMs = Math.round(parseFloat(execSync(`npx remotion ffprobe -v error -show_entries format=duration -of csv=p=0 "${src}"`, {cwd: root}).toString()) * 1000); } catch {} }
    music = {file, volume: FW.musicVolume ?? 0.12, muted: false, offset: 0, loop: true, ...(durationMs ? {durationMs} : {})};
  } else console.warn('musique introuvable :', src);
}

// ---- Réglages de rendu : repris d'un projet existant si fourni, sinon les défauts montage de Framewave ----
const tplPath = arg('--template');
const tpl = tplPath && fs.existsSync(tplPath) ? JSON.parse(fs.readFileSync(tplPath, 'utf8')) : null;
const render = tpl?.render ?? {
  aspect: '16:9', outputHeight: H, background: {type: 'color', color: '#000000'}, padding: 0, cornerRadius: 0,
  shadow: {enabled: false, blur: 60, opacity: 0.45, offsetY: 24, spread: 0}, border: {enabled: false, width: 2, color: '#ffffff', opacity: 0.25},
  tilt: {x: 0, y: 0}, crop: null,
  cursor: {mode: 'hidden', style: 'arrow', size: 1.4, smoothing: 0.55, clickEffect: 'none', clickColor: '#60a5fa', hideWhenIdle: false, idleAfterMs: 2500, tint: null, motionBlur: true},
  camera: {enabled: false, shape: 'circle', size: 0.26, position: 'bottom-right', custom: {x: 0.85, y: 0.8}, mirror: true, shadow: true, border: {enabled: true, width: 4, color: '#ffffff'}, radius: 24, zoom: 1, margin: 32, blurBackground: false},
  zoom: {autoEnabled: false, defaultScale: 1.6, transitionMs: 600, holdMs: 1800, easing: 'ease-in-out', sensitivity: 'medium', followCursor: false, followSmoothing: 0.6},
  keystrokes: {enabled: false, position: 'bottom', style: 'pill', size: 1, durationMs: 1400, showModifiersOnly: true},
  captions: {enabled: captions.length > 0, fontSize: 36, fontFamily: 'Inter, system-ui, sans-serif', color: '#ffffff', background: 'rgba(0,0,0,0.6)', position: 'bottom', highlightColor: '#9FE870', maxLines: 2},
  color: {brightness: 0, contrast: 0, saturation: 0, vignette: 0}, motionBlur: 0.2,
};
// La caméra du film est déjà dans l'image (mode baked) : ni curseur ni zoom auto par-dessus.
render.cursor = {...render.cursor, mode: 'hidden', clickEffect: 'none'};
render.zoom = {...render.zoom, autoEnabled: false};
render.camera = {...render.camera, enabled: false};
render.captions = {...render.captions, enabled: captions.length > 0};

const nowMs = Date.now();
const project = {
  id, name: NAME, version: 1, createdAt: nowMs, updatedAt: nowMs, dir,
  recording: {mode: 'montage', fps: FPS, durationMs: total, width: W, height: H, media, eventsOffsetMs: 0, scaleFactor: 1, recordedAt: nowMs},
  timeline: {
    clips: timelineClips, zooms, camera: [], texts: [], captions, audioClips,
    audio: {mic: {volume: 1, muted: false, gate: null, fadeIn: 0, fadeOut: 0}, system: {volume: 0.8, muted: false, gate: null, fadeIn: 0, fadeOut: 0}, camera: {volume: 1, muted: true, gate: null, fadeIn: 0, fadeOut: 0}, music},
    markers: FW.markers === false ? [] : placements.map((p, i) => ({id: `mk-${i}`, t: Math.round(p.start), label: p.plan})),
  },
  render,
  flags: {autoZoomDone: true},
};
fs.writeFileSync(path.join(dir, 'project.json'), JSON.stringify(project, null, 1), 'utf8');
// Vignette : le still du carton titre si présent, sinon rien (Framewave affiche un cadre vide).
const still = path.join(root, 'out/sheets/still-title.png');
if (fs.existsSync(still)) { try { execSync(`sips -s format jpeg -Z 640 "${still}" --out "${path.join(dir, 'thumb.jpg')}" >/dev/null 2>&1`); } catch {} }
// README dans le projet : ce que contient la timeline, pour la relecture dans Framewave.
const lines = placements.map((p, i) => `| ${i + 1} | ${p.plan} | ${(p.start / 1000).toFixed(1)} s | ${((p.end - p.start) / 1000).toFixed(1)} s | ${p.voId && voText[p.voId] ? voText[p.voId] : '—'} |`);
fs.writeFileSync(path.join(dir, 'README.md'), `# ${NAME}\n\nProjet généré par /demo-video le ${now.toLocaleString('fr-FR')}. Source : ${root}\n\n| # | Plan | Début | Durée | VO |\n|---|---|---|---|---|\n${lines.join('\n')}\n\n- VO : ${audioClips.length ? `${audioClips.length} blocs sur la piste Audio (déplaçables)` : 'dans les clips'}\n- Sous-titres : ${captions.length} segments (onglet Captions)\n- Zooms : ${zooms.length ? zooms.length + ' segments éditables' : 'dans l\'image (Remotion)'}\n- Musique : ${music ? music.file : 'aucune'}\n`);
fs.writeFileSync(path.join(root, 'out/framewave-project.json'), JSON.stringify({dir, id, name: NAME, totalMs: total, clips: placements.length, audioClips: audioClips.length, captions: captions.length, zooms: zooms.length}, null, 1));
console.log('Projet Framewave créé :', dir);
console.log(`${timelineClips.length} clips · ${audioClips.length} blocs VO · ${captions.length} sous-titres · ${zooms.length} zooms · ${project.timeline.markers.length} marqueurs · ${(total / 1000).toFixed(1)} s`);
