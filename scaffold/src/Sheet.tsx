import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Video} from './Video';
import {FONT_BODY} from './theme';
import type {Lang} from './ui/Lang';
// QA contact sheet: a grid of the main composition sampled every `step` frames, starting at `start`.
export const COLS = 4, ROWS = 6, CELL_W = 480, CELL_H = 270;
export const Sheet: React.FC<{start: number; step: number; lang: Lang}> = ({start, step, lang}) => (
  <AbsoluteFill style={{background: '#111', display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${CELL_W}px)`, gridAutoRows: `${CELL_H}px`}}>
    {Array.from({length: COLS * ROWS}, (_, i) => {
      const f = start + i * step;
      return (
        <div key={i} style={{position: 'relative', width: CELL_W, height: CELL_H, overflow: 'hidden', outline: '1px solid #333'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `scale(${CELL_W / 1920})`}}>
            <Sequence from={-f} layout="none"><Video lang={lang} /></Sequence>
          </div>
          <div style={{position: 'absolute', left: 6, top: 4, fontFamily: FONT_BODY, fontSize: 16, color: '#fff', background: 'rgba(0,0,0,.6)', padding: '2px 6px', borderRadius: 4}}>{`f${f} · ${(f / 30).toFixed(1)}s`}</div>
        </div>
      );
    })}
  </AbsoluteFill>
);
