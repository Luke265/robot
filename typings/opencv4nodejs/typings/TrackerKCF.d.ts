import { Mat } from './Mat';
import { Rect } from './Rect';
import { TrackerKCFParams } from './TrackerKCFParams';

export class TrackerKCF {
  constructor();
  constructor(params: TrackerKCFParams);
  clear(): void;
  init(frame: Mat, boundingBox: Rect): boolean;
  update(frame: Mat): Rect;
}
