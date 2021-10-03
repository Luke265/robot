import { Mat } from './Mat';
import { Rect } from './Rect';

export class TrackerTLD {
  constructor();
  clear(): void;
  init(frame: Mat, boundingBox: Rect): boolean;
  update(frame: Mat): Rect;
}
