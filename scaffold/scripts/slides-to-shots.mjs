// Slides → captures : rend chaque page d'un PDF en PNG 1600×N @2x dans public/shots/, une entrée de manifest par slide
// (rect `slide` = la page entière). Source : demo.config.json → capture.source (chemin .pdf).
// Google Slides : Fichier → Télécharger → PDF (ou https://docs.google.com/presentation/d/<ID>/export/pdf si partagé en lecture).
// PPTX / Keynote : exporter en PDF d'abord (skill anthropic-skills:pptx, ou `soffice --headless --convert-to pdf`).
// Rasterisation : PyMuPDF (pip install pymupdf) en priorité, sinon pdftoppm (brew install poppler).
import fs from 'node:fs'; import path from 'node:path'; import {execSync, spawnSync} from 'node:child_process'; import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const cfg = JSON.parse(fs.readFileSync(root + 'demo.config.json', 'utf8'));
const pdf = path.resolve(root, cfg.capture.source);
if (!fs.existsSync(pdf) || !pdf.endsWith('.pdf')) { console.error('capture.source doit pointer sur un PDF :', pdf); process.exit(1); }
const OUT = root + 'public/shots'; fs.mkdirSync(OUT, {recursive: true});
const W = (cfg.capture.cssWidth ?? 1600) * (cfg.capture.dpr ?? 2);
const py = `
import fitz, sys, json
doc = fitz.open(sys.argv[1]); out = sys.argv[2]; W = int(sys.argv[3]); m = {}
for i, page in enumerate(doc):
    z = W / page.rect.width
    pix = page.get_pixmap(matrix=fitz.Matrix(z, z), alpha=False)
    pix.save(f"{out}/slide-{i+1:02d}.png")
    cw, ch = W / ${cfg.capture.dpr ?? 2}, pix.height / ${cfg.capture.dpr ?? 2}
    m[f"slide-{i+1:02d}"] = {"slide": {"x": 0, "y": 0, "w": cw, "h": ch}, "viewport": {"w": cw, "h": ch}}
print(json.dumps(m))
`;
let manifest;
const r = spawnSync('python3', ['-c', py, pdf, OUT, String(W)], {encoding: 'utf8'});
if (r.status === 0) manifest = JSON.parse(r.stdout.trim().split('\n').pop());
else {
  console.warn('PyMuPDF indisponible (pip install pymupdf) → essai pdftoppm');
  try { execSync(`pdftoppm -png -scale-to-x ${W} -scale-to-y -1 "${pdf}" "${OUT}/slide"`); } catch { console.error('Ni PyMuPDF ni pdftoppm. Installe l\'un des deux.'); process.exit(1); }
  manifest = {};
  for (const f of fs.readdirSync(OUT).filter((f) => /^slide-\d+\.png$/.test(f)).sort()) {
    const id = f.replace('.png', '').replace(/slide-(\d+)/, (_, n) => 'slide-' + n.padStart(2, '0'));
    if (id + '.png' !== f) fs.renameSync(path.join(OUT, f), path.join(OUT, id + '.png'));
    const dims = execSync(`sips -g pixelWidth -g pixelHeight "${path.join(OUT, id + '.png')}"`).toString();
    const pw = +dims.match(/pixelWidth: (\d+)/)[1], ph = +dims.match(/pixelHeight: (\d+)/)[1];
    const cw = pw / (cfg.capture.dpr ?? 2), ch = ph / (cfg.capture.dpr ?? 2);
    manifest[id] = {slide: {x: 0, y: 0, w: cw, h: ch}, viewport: {w: cw, h: ch}};
  }
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(Object.keys(manifest).length, 'slides →', OUT);
console.log('Note : les rects de zoom (titre, chiffre, schéma) se déclarent à la main dans beats.mjs via d.S(x, y, w, h) en px css, relevés sur les PNG.');
