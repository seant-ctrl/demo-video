// ElevenLabs TTS : un fichier par plan → public/vo/<id>.mp3 + manifest.json {id:{file,seconds,words}}.
// Script lu dans voiceover/script-<lang>.json ([{id, text}]). Langue = demo.config.json → lang (ou ELEVEN_LANG).
// Clé : env ELEVENLABS_API_KEY, sinon ./.env, sinon ~/.demo-video/.env. Jamais affichée, jamais écrite dans un livrable.
// Options : --force (régénère tout) · --only=p03,p04 · ELEVEN_VOICE_ID · ELEVEN_MODEL · ELEVEN_SPEED
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import {execSync} from 'node:child_process'; import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const cfg = JSON.parse(fs.readFileSync(root + 'demo.config.json', 'utf8'));
const lang = process.env.ELEVEN_LANG || cfg.lang || 'fr';
const scriptPath = root + `voiceover/script-${lang}.json`;
if (!fs.existsSync(scriptPath)) { console.error('missing', scriptPath); process.exit(1); }
const script = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
const readKey = (p) => { if (!fs.existsSync(p)) return null; const m = fs.readFileSync(p, 'utf8').match(/^ELEVENLABS_API_KEY=(.+)$/m); return m ? m[1].trim().replace(/^["']|["']$/g, '') : null; };
const key = process.env.ELEVENLABS_API_KEY || readKey(root + '.env') || readKey(path.join(os.homedir(), '.demo-video', '.env'));
if (!key) { console.error('No ELEVENLABS_API_KEY (env, ./.env ou ~/.demo-video/.env)'); process.exit(1); }
// George (JBFqnCBsd6RMkjVDRZzb) : voix multilingue du catalogue par défaut, lit correctement le français. Disponible sur le plan Free.
const VOICE = process.env.ELEVEN_VOICE_ID || cfg.voice?.id || 'JBFqnCBsd6RMkjVDRZzb';
const MODEL = process.env.ELEVEN_MODEL || cfg.voice?.model || 'eleven_multilingual_v2';
const SPEED = Number(process.env.ELEVEN_SPEED || cfg.voice?.speed || 1.0);
const SETTINGS = {stability: 0.55, similarity_boost: 0.75, style: 0.25, speed: SPEED, use_speaker_boost: true, ...(cfg.voice?.settings ?? {})};
const force = process.argv.includes('--force');
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',');
const out = root + 'public/vo/'; fs.mkdirSync(out, {recursive: true});
const manifestPath = out + 'manifest.json';
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
// Durée réelle du MP3 : afinfo (macOS) ; ffprobe en secours.
const dur = (f) => {
  try { return parseFloat(execSync(`afinfo "${f}" | awk '/estimated duration/{print $3}'`).toString()); } catch {}
  // ffprobe embarqué par Remotion (le binaire de node_modules ne se lance pas seul : passer par le CLI)
  return parseFloat(execSync(`npx remotion ffprobe -v error -show_entries format=duration -of csv=p=0 "${f}"`, {cwd: root}).toString());
};
const words = (t) => (t.match(/[0-9A-Za-zÀ-ÿ][0-9A-Za-zÀ-ÿ'’\-]*/g) || []).length;
for (let i = 0; i < script.length; i++) {
  const s = script[i]; const f = out + s.id + '.mp3';
  if (only && !only.includes(s.id)) continue;
  const stale = manifest[s.id] && manifest[s.id].text && manifest[s.id].text !== s.text; // texte modifié → régénérer
  if (force || stale || !fs.existsSync(f)) {
    // previous_text / next_text : la prosodie enchaîne d'un plan au suivant au lieu de repartir à plat.
    const body = {text: s.text, model_id: MODEL, language_code: lang, voice_settings: SETTINGS, previous_text: script[i - 1]?.text, next_text: script[i + 1]?.text};
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`,
      {method: 'POST', headers: {'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg'}, body: JSON.stringify(body)});
    if (!r.ok) { console.error('ElevenLabs error', r.status, (await r.text()).slice(0, 400)); if (r.status === 402) console.error('→ 402 : voix de bibliothèque refusée sur le plan Free. Garde George ou passe une voix du catalogue par défaut.'); process.exit(1); }
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  }
  manifest[s.id] = {file: 'vo/' + s.id + '.mp3', seconds: dur(f), engine: 'elevenlabs', voice: VOICE, model: MODEL, lang, words: words(s.text), text: s.text};
  console.log(s.id, manifest[s.id].seconds.toFixed(2) + 's', manifest[s.id].words + 'w', stale ? '(texte modifié → régénéré)' : '');
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
const total = Object.values(manifest).reduce((a, b) => a + b.seconds, 0), w = Object.values(manifest).reduce((a, b) => a + b.words, 0);
console.log('TOTAL VO', total.toFixed(1), 's ·', w, 'mots ·', (w / total).toFixed(2), 'mots/s ·', Object.keys(manifest).length, 'pistes');
