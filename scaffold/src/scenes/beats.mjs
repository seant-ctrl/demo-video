// Specs des plans d'écran (P01..Pn). P00 = carton titre, dernier = outro : gérés par Video.tsx via DEMO.title / DEMO.outro.
// Données pures. Rects depuis les captures (d.R(shot, key)), textes ajoutés depuis TEXTS[lang].
// Frames @fps, coordonnées en px vidéo (plan 1920 x planeH). L'audio étire un plan s'il dépasse la chorégraphie.
//
// Un beat :
// {
//   id: 'P01-nom', voId: 'p01', min: 180,                 // durée minimale (frames) ; réelle = max(min, VO + tail)
//   tail: 20,                                              // silence après la VO (défaut 20 f)
//   shots: [{id: 'shot-a', at: 0, fade: 0}, {id: 'shot-b', at: 90}],   // coupe franche par défaut (fade: 0)
//   cam: [{f: 0, ...WIDE}, {f: 60, cx, cy, z: 1.5}, {f: 179, cx, cy, z: 1.5}],  // caméra : z, centre (cx, cy)
//   cursor: [{f: 0, x, y}, {f: 60, x, y, click: true}],   // [] pour aucun curseur
//   hl: [{r: rect, from: 20, to: 80, label: T.maCle, side: 'bottom', text: false}], // text:false = zoom < 1.5 assumé
//   subjects: [{r: FULL, from: 0, to: 179}],               // rects qui doivent rester dans la zone de sécurité
//   captions: [{text: T.legende, from: 40, to: 170}],      // légende basse (30 px)
// }
export const WIDE = {cx: 960, cy: 540, z: 0.9}; // plan « page entière » : 1728x972 = la zone de sécurité exacte

export function makeBeats(d, T) {
  const {R: r, FULL, cx, cy, union} = d;
  return [
    // { id: 'P01-entree', voId: 'p01', min: 180, shots: [{id: 'home', at: 0, fade: 0}], cam: [{f: 0, ...WIDE}, {f: 179, ...WIDE}], cursor: [], subjects: [{r: FULL, from: 0, to: 179}] },
  ];
}
