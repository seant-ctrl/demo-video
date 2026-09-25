import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import {Beat, BeatSpec, beatDuration} from './ui/Beat';
import {OutroCard, TitleCard} from './ui/Cards';
import {LangContext, dataFor} from './ui/Lang';
import {beatsFor, titleFrames, outroFrames} from './Video';
import {DEMO} from './demo.mjs';
import {C} from './theme';

// Un plan = un clip autonome, sans recouvrement ni fondu : c'est l'unité que Framewave manipule.
// La VO est embarquée dans le clip seulement si demo.config.json → framewave.voTrack === 'baked'.
// En mode 'separate' (défaut), les clips sont muets côté voix (SFX conservés) et la VO devient un bloc audio Framewave.
export type ClipDef = {id: string; frames: number; kind: 'title' | 'beat' | 'outro'; spec?: BeatSpec; voId: string};
const LANG = (DEMO.lang ?? 'fr') as 'fr';
export const VO_BAKED = (DEMO as {framewave?: {voTrack?: string}}).framewave?.voTrack === 'baked';

export const clipList = (): ClipDef[] => {
  const d = dataFor(LANG);
  const list: ClipDef[] = [];
  const t = titleFrames(d), o = outroFrames(d);
  if (t > 0) list.push({id: 'P00-titre', frames: t, kind: 'title', voId: DEMO.title.voId});
  for (const b of beatsFor(LANG)) list.push({id: b.id, frames: beatDuration(b, d), kind: 'beat', spec: b, voId: b.voId});
  if (o > 0) list.push({id: `P${String(list.length).padStart(2, '0')}-outro`, frames: o, kind: 'outro', voId: DEMO.outro.voId});
  return list;
};

export const Clip: React.FC<{index: number}> = ({index}) => {
  const c = clipList()[index];
  const d = dataFor(LANG);
  const vo = VO_BAKED && d.hasVO(c.voId) ? <Audio src={staticFile(d.voFile(c.voId) as string)} /> : null;
  return (
    <LangContext.Provider value={LANG}>
      <AbsoluteFill style={{background: c.kind === 'beat' ? C.pageBg : C.cardBg}}>
        {c.kind === 'title' ? (<><TitleCard />{vo}</>)
          : c.kind === 'outro' ? (<><OutroCard />{vo}</>)
          : <Beat spec={c.spec as BeatSpec} withVO={VO_BAKED} />}
      </AbsoluteFill>
    </LangContext.Provider>
  );
};
