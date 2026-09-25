import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, D, EASE_EMPH, FONT_BODY, FONT_HEAD, LOGO, LOGO_RATIO} from '../theme';
import {textsFor, useLang} from './Lang';
const rise = (frame: number, from: number, dur = D.slow) => ({
  opacity: interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  translate: `0 ${interpolate(frame, [from, from + dur], [28, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(...EASE_EMPH)})}px`,
});
export const Logo: React.FC<{height?: number}> = ({height = 56}) => (LOGO ? <Img src={staticFile(LOGO)} style={{height, width: height * LOGO_RATIO, display: 'block'}} /> : null);
const Glow: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const x = interpolate(frame, [0, durationInFrames], [30, 55]);
  const y = interpolate(frame, [0, durationInFrames], [40, 55]);
  return <AbsoluteFill style={{background: `radial-gradient(60% 70% at ${x}% ${y}%, ${C.brand700}66 0%, transparent 70%)`}} />;
};
// Carton titre : logo, titre, sous-titre, pills. Tous les textes viennent de TEXTS[lang].
export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const T = textsFor(useLang());
  const {durationInFrames} = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const long = T.title.length > 18;
  return (
    <AbsoluteFill style={{background: C.cardBg, opacity: out}}>
      <Glow />
      <AbsoluteFill style={{padding: '0 160px', justifyContent: 'center', gap: 26}}>
        <div style={rise(frame, 0)}><Logo height={52} /></div>
        <div style={{fontFamily: FONT_HEAD, fontWeight: 700, fontSize: long ? 96 : 124, color: C.white, lineHeight: 1.0, letterSpacing: -3, ...rise(frame, 6)}}>{T.title}</div>
        <div style={{fontFamily: FONT_BODY, fontSize: 44, color: C.accentSoft, fontWeight: 500, letterSpacing: -0.5, maxWidth: 1400, lineHeight: 1.25, ...rise(frame, 14)}}>{T.subtitle}</div>
        {T.pills?.length ? (
          <div style={{display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap', ...rise(frame, 24)}}>
            {T.pills.map((t) => (
              <div key={t} style={{fontFamily: FONT_BODY, fontSize: 28, color: C.white, border: `2px solid ${C.accent}`, padding: '12px 22px', borderRadius: 999}}>{t}</div>
            ))}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
// Carton outro : 2 à 4 lignes en cascade, puis le logo.
export const OutroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const T = textsFor(useLang());
  const {durationInFrames} = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lines = T.outro ?? [];
  return (
    <AbsoluteFill style={{background: C.cardBg, opacity: out}}>
      <Glow />
      <AbsoluteFill style={{padding: '0 160px', justifyContent: 'center', gap: 24}}>
        {lines.map((r, i) => (
          <div key={r} style={{display: 'flex', alignItems: 'center', gap: 28, ...rise(frame, 4 + i * 22)}}>
            <div style={{width: 22, height: 22, borderRadius: 6, background: C.logo, flex: 'none'}} />
            <div style={{fontFamily: FONT_HEAD, fontWeight: 700, fontSize: lines.length > 3 ? 58 : 70, color: C.white, letterSpacing: -1.5, lineHeight: 1.1}}>{r}</div>
          </div>
        ))}
        <div style={{marginTop: 56, ...rise(frame, 4 + lines.length * 22 + 18)}}><Logo height={60} /></div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
// Carton intermédiaire (changement de rôle / de partie) : une puce + un libellé, fond clair.
export const RoleCard: React.FC<{label: string; initials?: string}> = ({label, initials}) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, D.std], [-40, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(...EASE_EMPH)});
  const o = interpolate(frame, [0, D.std], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.pageBg, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 28, translate: `${x}px 0`, opacity: o}}>
        {initials && <div style={{width: 96, height: 96, borderRadius: 999, background: C.accentSoft, color: C.cardBg, fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{initials}</div>}
        <div style={{fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 56, color: C.grey1000, letterSpacing: -1}}>{label}</div>
      </div>
    </AbsoluteFill>
  );
};
