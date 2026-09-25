import React from 'react';
import {AbsoluteFill, Sequence, staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import {Camera, CamKey} from './Camera';
import {Cursor, CursorKey} from './Cursor';
import {Shot} from './Shot';
import {Caption, HighlightBox, LabelLayer, HL, Rect} from './Callout';
import {Data, useData} from './Lang';
import {DEMO} from '../demo.mjs';
export type BeatSpec = {
  id: string;
  voId: string;
  min: number; // durée de la chorégraphie en frames
  tail?: number; // silence après la VO (défaut 20 f)
  shots: {id: string; at: number; fade?: number}[];
  cam: CamKey[];
  cursor: CursorKey[];
  hl?: HL[];
  subjects?: {r: Rect; from: number; to: number}[]; // rects qui doivent rester dans la zone de sécurité
  captions?: {text: string; from: number; to?: number}[];
};
// L'audio est la source de vérité : un plan dure au moins sa VO + queue.
export const beatDuration = (b: BeatSpec, d: Data) => Math.max(b.min, d.voFrames(b.voId) + (b.tail ?? 20));
export const beatPlaneH = (b: BeatSpec, d: Data) => Math.max(...b.shots.map((s) => d.plane(s.id).h));
// Mode zooms 'framewave' : la caméra reste à 1,0 (plan plat), les zooms sont exportés comme segments éditables dans Framewave.
export const FLAT_CAM: CamKey[] = [{f: 0, cx: 960, cy: 540, z: 1}];
export const camKeys = (b: BeatSpec): CamKey[] => (DEMO.zooms === 'framewave' ? FLAT_CAM : b.cam);
export const Beat: React.FC<{spec: BeatSpec; withVO?: boolean}> = ({spec, withVO = true}) => {
  const d = useData();
  const clicks = DEMO.sfxClick ? spec.cursor.filter((k) => k.click).map((k) => k.f) : [];
  const planeH = beatPlaneH(spec, d);
  const cam = camKeys(spec);
  return (
    <AbsoluteFill>
      {withVO && d.hasVO(spec.voId) && <Audio src={staticFile(d.voFile(spec.voId) as string)} />}
      {clicks.map((f) => (
        <Sequence key={f} from={f} durationInFrames={20} layout="none">
          <Audio src={staticFile('sfx/click.wav')} volume={0.35} />
        </Sequence>
      ))}
      <Camera keys={cam} planeH={planeH}>
        {spec.shots.map((s, i) => (
          <Sequence key={s.id + s.at} from={s.at} layout="none">
            <Shot id={s.id} fadeIn={s.fade ?? (i === 0 ? 8 : 0)} />
          </Sequence>
        ))}
        {(spec.hl ?? []).map((h, i) => <HighlightBox key={i} h={h} />)}
        {DEMO.cursor && <Cursor keys={spec.cursor} />}
      </Camera>
      <LabelLayer hl={spec.hl ?? []} cam={cam} planeH={planeH} />
      {(spec.captions ?? []).map((c, i) => <Caption key={i} text={c.text} from={c.from} to={c.to} />)}
    </AbsoluteFill>
  );
};
