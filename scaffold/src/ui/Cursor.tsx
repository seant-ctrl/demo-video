import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {EASE, C} from '../theme';
export type CursorKey = {f: number; x: number; y: number; click?: boolean};
// Keyframes in video px (1920x1080). Cursor eases between keys; a key with click renders a ripple + press.
export const Cursor: React.FC<{keys: CursorKey[]; visibleFrom?: number; visibleTo?: number}> = ({keys, visibleFrom = 0, visibleTo = 1e9}) => {
  const frame = useCurrentFrame();
  if (keys.length === 0 || frame < visibleFrom || frame > visibleTo) return null;
  const fs = keys.map((k) => k.f);
  const ease = Easing.bezier(...EASE);
  const x = keys.length > 1 ? interpolate(frame, fs, keys.map((k) => k.x), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease}) : keys[0].x;
  const y = keys.length > 1 ? interpolate(frame, fs, keys.map((k) => k.y), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease}) : keys[0].y;
  const clicks = keys.filter((k) => k.click);
  const opacity = interpolate(frame, [visibleFrom, visibleFrom + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  let press = 1;
  for (const c of clicks) {
    const d = frame - c.f;
    if (d >= 0 && d <= 8) press = interpolate(d, [0, 3, 8], [1, 0.86, 1], {extrapolateRight: 'clamp'});
  }
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity}}>
      {clicks.map((c) => {
        const d = frame - c.f;
        if (d < 0 || d > 22) return null;
        const r = interpolate(d, [0, 22], [10, 46], {easing: Easing.out(Easing.cubic)});
        const o = interpolate(d, [0, 4, 22], [0, 0.55, 0], {extrapolateRight: 'clamp'});
        return <div key={c.f} style={{position: 'absolute', left: c.x - r, top: c.y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `3px solid ${C.accent}`, background: `${C.accent}22`, opacity: o}} />;
      })}
      <svg width={34} height={38} viewBox="0 0 24 28" style={{position: 'absolute', left: x - 3, top: y - 2, scale: String(press), transformOrigin: '3px 2px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.35))'}}>
        <path d="M3 2 L3 22 L8.2 17.4 L11.6 25 L15 23.5 L11.7 16 L18.5 16 Z" fill="#111" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </div>
  );
};
