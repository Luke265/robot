import { Mat } from './Mat';
import { Rect } from './Rect';

export class TrackerGOTURN {
  constructor();
  clear(): void;
  init(frame: Mat, boundingBox: Rect): boolean;
  update(frame: Mat): Rect;
}
