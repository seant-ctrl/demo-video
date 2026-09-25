import React from 'react';
import {useCurrentFrame} from 'remotion';
import {camAt, VID_W} from '../cam.mjs';
export type CamKey = {f: number; cx: number; cy: number; z: number};
// Camera over the shot plane (1920 x planeH). z < 1 = wide shot: the whole plane sits centered in the frame as a rounded window.
export const Camera: React.FC<{keys: CamKey[]; planeH?: number; children: React.ReactNode}> = ({keys, planeH = 1080, children}) => {
  const frame = useCurrentFrame();
  const {z, tx, ty} = camAt(keys, frame, planeH);
  const wide = z < 0.985;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: VID_W, height: planeH, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${z})`, borderRadius: wide ? 18 : 0, overflow: wide ? 'hidden' : 'visible', boxShadow: wide ? '0 24px 80px rgba(45,51,49,.22)' : 'none'}}>{children}</div>
    </div>
  );
};
