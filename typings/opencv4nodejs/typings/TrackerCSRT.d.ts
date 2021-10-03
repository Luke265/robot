import { Mat } from './Mat';
import { Rect } from './Rect';
import { TrackerCSRTParams } from './TrackerCSRTParams';

export class TrackerCSRT {
  constructor();
  constructor(params: TrackerCSRTParams);
  clear(): void;
  init(frame: Mat, boundingBox: Rect): boolean;
  update(frame: Mat): Rect;
}
