import React from 'react';
import {AbsoluteFill, Series, staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {Beat, BeatSpec, beatDuration} from './ui/Beat';
import {OutroCard, TitleCard} from './ui/Cards';
import {makeBeats} from './scenes/beats.mjs';
import {Lang, LangContext, dataFor, textsFor} from './ui/Lang';
import {DEMO} from './demo.mjs';
import {C} from './theme';
export const OVERLAP = 8;    // crossfade audio entre plans (l'image coupe franc)
export const TRANSITION = 12; // fondu carton ↔ écrans
export const TITLE_TAIL = DEMO.title?.tail ?? 60, OUTRO_TAIL = DEMO.outro?.tail ?? 15;
export const beatsFor = (lang: Lang) => makeBeats(dataFor(lang), textsFor(lang)) as BeatSpec[];
// Cartons : durée = VO + queue ; sans VO, une durée fixe lisible (3,5 s titre, 4 s outro).
export const titleFrames = (d: ReturnType<typeof dataFor>) => (DEMO.titleCard ? (d.hasVO(DEMO.title.voId) ? d.voFrames(DEMO.title.voId) + TITLE_TAIL : 105) : 0);
export const outroFrames = (d: ReturnType<typeof dataFor>) => (DEMO.outroCard ? (d.hasVO(DEMO.outro.voId) ? d.voFrames(DEMO.outro.voId) + OUTRO_TAIL : 120) : 0);
export const timeline = (lang: Lang) => {
  const d = dataFor(lang), beats = beatsFor(lang);
  const seg = beats.length ? beats.reduce((a, b) => a + beatDuration(b, d), 0) - OVERLAP * (beats.length - 1) : 0;
  const title = titleFrames(d), outro = outroFrames(d);
  const transitions = (title ? TRANSITION : 0) + (outro ? TRANSITION : 0);
  return {beats, seg, title, outro, total: title + seg + outro - transitions};
};
const Segment: React.FC<{lang: Lang}> = ({lang}) => {
  const d = dataFor(lang), beats = beatsFor(lang);
  return (
    <AbsoluteFill style={{background: C.pageBg}}>
      <Series>
        {beats.map((b, i) => (
          <Series.Sequence key={b.id} durationInFrames={beatDuration(b, d)} offset={i === 0 ? 0 : -OVERLAP} name={b.id}>
            <Beat spec={b} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
const VO: React.FC<{d: ReturnType<typeof dataFor>; id: string}> = ({d, id}) => (d.hasVO(id) ? <Audio src={staticFile(d.voFile(id) as string)} /> : null);
export const Video: React.FC<{lang?: Lang}> = ({lang = (DEMO.lang as Lang) ?? 'fr'}) => {
  const d = dataFor(lang);
  const {seg, title, outro} = timeline(lang);
  return (
    <LangContext.Provider value={lang}>
      <AbsoluteFill style={{background: C.cardBg}}>
        <TransitionSeries>
          {title > 0 && (
            <TransitionSeries.Sequence durationInFrames={title} name="Titre">
              <TitleCard />
              <VO d={d} id={DEMO.title.voId} />
            </TransitionSeries.Sequence>
          )}
          {title > 0 && <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANSITION})} />}
          <TransitionSeries.Sequence durationInFrames={Math.max(1, seg)} name="Ecrans">
            <Segment lang={lang} />
          </TransitionSeries.Sequence>
          {outro > 0 && <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANSITION})} />}
          {outro > 0 && (
            <TransitionSeries.Sequence durationInFrames={outro} name="Outro">
              <OutroCard />
              <VO d={d} id={DEMO.outro.voId} />
            </TransitionSeries.Sequence>
          )}
        </TransitionSeries>
      </AbsoluteFill>
    </LangContext.Provider>
  );
};
