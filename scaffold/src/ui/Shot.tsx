import React from 'react';
import {Img, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {useData} from './Lang';
// A 1600xN css @2x screenshot laid on the plane (x1.2), quick fade-in. Language picks the shots folder.
export const Shot: React.FC<{id: string; fadeIn?: number}> = ({id, fadeIn = 0}) => {
  const frame = useCurrentFrame();
  const d = useData();
  const p = d.plane(id);
  const opacity = fadeIn > 0 ? interpolate(frame, [0, fadeIn], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  return <Img src={staticFile(`${d.dir}/${id}.png`)} style={{position: 'absolute', left: 0, top: 0, width: p.w, height: p.h, opacity}} />;
};
