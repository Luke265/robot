import { Mat } from './Mat';
import { Rect } from './Rect';

export class TrackerMedianFlow {
  constructor(pointsInGrid?: number);
  clear(): void;
  init(frame: Mat, boundingBox: Rect): boolean;
  update(frame: Mat): Rect;
}
