// Rect / VO helpers over the generated manifests. Shot css px (cssWidth) -> video px (1920 wide): x K.
// La VO est optionnelle : sans manifest VO, voFrames() vaut 0 et les plans durent leur chorégraphie (`min`).
import {GENERATED} from './generated.mjs';
import {DEMO} from './demo.mjs';
export const FPS = DEMO.fps ?? 30;
export const ZERO = {x: 0, y: 0, w: 0, h: 0};
export const FULL = {x: 0, y: 0, w: 1920, h: 1080};
export const LANGS = Object.keys(GENERATED);
export const cx = (r) => r.x + r.w / 2;
export const cy = (r) => r.y + r.h / 2;
export const union = (...rs) => { const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y)); return {x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y}; };
export function makeData(lang = DEMO.lang ?? 'fr') {
  const g = GENERATED[lang];
  if (!g) throw new Error('no generated data for lang ' + lang);
  const {SHOTS, VO, dir, K = 1.2} = g;
  const MISSING = [];
  const S = (x, y, w, h) => ({x: x * K, y: y * K, w: w * K, h: h * K});
  const R = (shot, key) => {
    const s = SHOTS[shot]; const r = s && s[key];
    if (!r) { MISSING.push(shot + '.' + key); return ZERO; }
    return {x: r.x * K, y: r.y * K, w: r.w * K, h: r.h * K};
  };
  const has = (id) => !!(VO && VO[id]);
  return {
    lang, dir, K, MISSING, R, S, FULL, ZERO, cx, cy, union,
    plane: (shot) => { const s = SHOTS[shot]; if (!s) { MISSING.push(shot + '.viewport'); return {w: 1920, h: 1080}; } return {w: s.viewport.w * K, h: s.viewport.h * K}; },
    hasVO: (id) => has(id),
    voFrames: (id) => (has(id) ? Math.ceil(VO[id].seconds * FPS) : 0),
    voFile: (id) => (has(id) ? VO[id].file : null),
    voSeconds: (id) => (has(id) ? VO[id].seconds : 0),
  };
}
