import React from 'react';
import {Composition} from 'remotion';
import {Video, timeline} from './Video';
import {Sheet, COLS, ROWS, CELL_W, CELL_H} from './Sheet';
import {Clip, clipList} from './Clip';
import {DEMO} from './demo.mjs';
import './fonts';
const STEP = 90; // une vignette QA toutes les 3 s
const FPS = DEMO.fps ?? 30, W = DEMO.width ?? 1920, H = DEMO.height ?? 1080;
const LANG = (DEMO.lang ?? 'fr') as 'fr';
export const Root: React.FC = () => {
  const total = Math.max(1, timeline(LANG).total);
  const perSheet = COLS * ROWS * STEP;
  return (
    <>
      <Composition id="Demo" component={Video} defaultProps={{lang: LANG}} durationInFrames={total} fps={FPS} width={W} height={H} />
      {[0, 1, 2].map((i) => (
        <Composition key={i} id={`Sheet${i + 1}`} component={Sheet} defaultProps={{start: i * perSheet, step: STEP, lang: LANG}} durationInFrames={1} fps={FPS} width={COLS * CELL_W} height={ROWS * CELL_H} />
      ))}
      {clipList().map((c, i) => (
        <Composition key={c.id} id={`Clip-${c.id}`} component={Clip} defaultProps={{index: i}} durationInFrames={Math.max(1, c.frames)} fps={FPS} width={W} height={H} />
      ))}
    </>
  );
};
