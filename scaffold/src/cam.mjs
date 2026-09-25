// Pure camera math shared by the Remotion components and scripts/check-safe.mjs.
// Plane = the screenshot space (1920 x planeH video px). Frame = 1920x1080.
export const VID_W = 1920, VID_H = 1080;
export const SAFE = {x0: 96, y0: 54, x1: 1824, y1: 1026}; // 5% margins
export const EASE = [0.2, 0, 0, 1]; // Corporate signature easing
// The camera may pan up to MARGIN px beyond the screenshot. Everything outside the plane is the composition's own
// grey200 background — the exact colour of the app's --bg-page — so the extension is seamless. 340 px is what it
// takes to centre the right-hand configuration rail instead of leaving it stuck in the right third of the frame.
export const MARGIN = 340;

// cubic-bezier(x1,y1,x2,y2) solver (same curve as CSS / Remotion Easing.bezier)
export function bezier(x1, y1, x2, y2) {
  const A = (a, b) => 1 - 3 * b + 3 * a, B = (a, b) => 3 * b - 6 * a, C = (a) => 3 * a;
  const calc = (t, a, b) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
  const slope = (t, a, b) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
  return (x) => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) { const s = slope(t, x1, x2); if (Math.abs(s) < 1e-6) break; t -= (calc(t, x1, x2) - x) / s; }
    return calc(t, y1, y2);
  };
}
const ease = bezier(...EASE);

function interp(f, keys, prop) {
  if (keys.length === 1) return keys[0][prop];
  if (f <= keys[0].f) return keys[0][prop];
  const last = keys[keys.length - 1];
  if (f >= last.f) return last[prop];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (f >= a.f && f <= b.f) {
      const t = b.f === a.f ? 1 : (f - a.f) / (b.f - a.f);
      return a[prop] + (b[prop] - a[prop]) * ease(t);
    }
  }
  return last[prop];
}

// Camera state at frame f: zoom z, translation (tx, ty) applied to the plane (transform-origin 0 0).
export function camAt(keys, f, planeH = VID_H) {
  const z = interp(f, keys, 'z');
  let cx = interp(f, keys, 'cx'), cy = interp(f, keys, 'cy');
  let tx, ty;
  if (z < 1) { // wide shot: whole plane centered inside the frame
    tx = (VID_W - VID_W * z) / 2; ty = (VID_H - planeH * z) / 2;
  } else {
    // Débordement asymétrique. À droite et en bas du plateau, l'app a déjà son fond --bg-page (= grey200,
    // la couleur de la composition) : sortir du plateau y est invisible. En haut il y a la topbar et à gauche
    // la sidebar, tous deux blancs : déborder de ce côté ferait apparaître une couture. On l'interdit.
    const minCx = VID_W / 2 / z, maxCx = VID_W - VID_W / 2 / z + MARGIN, minCy = VID_H / 2 / z, maxCy = planeH - VID_H / 2 / z + MARGIN;
    cx = Math.min(Math.max(cx, minCx), maxCx); cy = Math.min(Math.max(cy, minCy), Math.max(minCy, maxCy));
    tx = VID_W / 2 - cx * z; ty = VID_H / 2 - cy * z;
  }
  return {z, tx, ty};
}
export const project = (r, cam) => ({x: r.x * cam.z + cam.tx, y: r.y * cam.z + cam.ty, w: r.w * cam.z, h: r.h * cam.z});

// Label pill geometry (frame space). Conservative width estimate so clamping never under-shoots.
export const LABEL_FONT = 28, LABEL_H = 50, LABEL_GAP = 14;
export const labelWidth = (text) => Math.ceil(text.length * 15.5 + 40);
export function placeLabel(p, side, text) {
  const w = labelWidth(text), h = LABEL_H;
  let x, y;
  if (side === 'bottom') { x = p.x; y = p.y + p.h + LABEL_GAP; }
  else if (side === 'top') { x = p.x; y = p.y - LABEL_GAP - h; }
  else if (side === 'left') { x = p.x - LABEL_GAP - w; y = p.y + p.h / 2 - h / 2; }
  else { x = p.x + p.w + LABEL_GAP; y = p.y + p.h / 2 - h / 2; }
  x = Math.min(Math.max(x, SAFE.x0), SAFE.x1 - w); y = Math.min(Math.max(y, SAFE.y0), SAFE.y1 - h);
  return {x, y, w, h};
}
export const inSafe = (p, tol = 0.6) => p.x >= SAFE.x0 - tol && p.y >= SAFE.y0 - tol && p.x + p.w <= SAFE.x1 + tol && p.y + p.h <= SAFE.y1 + tol;
