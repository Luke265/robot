import { Mat } from './Mat';
import { Rect } from './Rect';
import { TrackerMILParams } from './TrackerMILParams';

export class TrackerMIL {
  constructor();
  constructor(params: TrackerMILParams);
  clear(): void;
  init(frame: Mat, boundingBox: Rect): boolean;
  update(frame: Mat): Rect;
}
