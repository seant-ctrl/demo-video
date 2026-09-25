import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, D, EASE_EMPH, FONT_BODY} from '../theme';
import {camAt, project, placeLabel, LABEL_FONT, LABEL_H} from '../cam.mjs';
import type {CamKey} from './Camera';
export type Rect = {x: number; y: number; w: number; h: number};
export type HL = {r: Rect; from: number; to?: number; label?: string; side?: 'top' | 'bottom' | 'left' | 'right'; color?: string; text?: boolean};

// Box around a target rect: rendered INSIDE the camera (plane space).
export const HighlightBox: React.FC<{h: HL}> = ({h}) => {
  const frame = useCurrentFrame();
  const to = h.to ?? 1e9;
  if (frame < h.from || frame > to) return null;
  const t = interpolate(frame, [h.from, h.from + D.std], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(...EASE_EMPH)});
  const out = interpolate(frame, [to - 6, to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pad = 6, color = h.color ?? C.accent;
  return <div style={{position: 'absolute', left: h.r.x - pad, top: h.r.y - pad, width: h.r.w + pad * 2, height: h.r.h + pad * 2, border: `2.5px solid ${color}`, borderRadius: 10, opacity: t * out, scale: String(interpolate(t, [0, 1], [1.05, 1])), boxShadow: `0 0 0 5px ${color}22`, pointerEvents: 'none'}} />;
};

// Label pills: rendered in FRAME space (outside the camera) so they keep a fixed 28px size and stay in the safe zone.
export const LabelLayer: React.FC<{hl: HL[]; cam: CamKey[]; planeH?: number}> = ({hl, cam, planeH = 1080}) => {
  const frame = useCurrentFrame();
  const c = camAt(cam, frame, planeH);
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {hl.map((h, i) => {
        const to = h.to ?? 1e9;
        if (!h.label || frame < h.from + 4 || frame > to) return null;
        const p = project(h.r, c);
        const pos = placeLabel({x: p.x - 6, y: p.y - 6, w: p.w + 12, h: p.h + 12}, h.side ?? 'bottom', h.label);
        const inT = interpolate(frame, [h.from + 4, h.from + 4 + D.std], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(...EASE_EMPH)});
        const out = interpolate(frame, [to - 6, to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div key={i} style={{position: 'absolute', left: pos.x, top: pos.y + (1 - inT) * 14, height: LABEL_H, display: 'flex', alignItems: 'center', padding: '0 20px', fontFamily: FONT_BODY, fontSize: LABEL_FONT, fontWeight: 600, letterSpacing: -0.2, color: C.white, background: h.color ?? C.accent, borderRadius: 12, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,.18)', opacity: inT * out}}>{h.label}</div>
        );
      })}
    </div>
  );
};

// Bottom caption (key sentence of the beat), inside the safe zone.
export const Caption: React.FC<{text: string; from: number; to?: number}> = ({text, from, to = 1e9}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const inT = interpolate(frame, [from, from + D.std], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(...EASE_EMPH)});
  const outT = interpolate(frame, [to - 8, to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 64, display: 'flex', justifyContent: 'center', pointerEvents: 'none', opacity: inT * outT, translate: `0 ${(1 - inT) * 18}px`}}>
      <div style={{fontFamily: FONT_BODY, fontSize: 30, fontWeight: 500, color: C.white, background: C.captionBg, padding: '14px 28px', borderRadius: 14, maxWidth: 1400, textAlign: 'center', lineHeight: 1.3, letterSpacing: -0.2, boxShadow: '0 10px 30px rgba(0,0,0,.25)'}}>{text}</div>
    </div>
  );
};
