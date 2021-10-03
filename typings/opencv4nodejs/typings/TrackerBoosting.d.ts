import { Mat } from './Mat';
import { Rect } from './Rect';
import { TrackerBoostingParams } from './TrackerBoostingParams';

export class TrackerBoosting {
  constructor();
  constructor(params: TrackerBoostingParams);
  clear(): void;
  init(frame: Mat, boundingBox: Rect): boolean;
  update(frame: Mat): Rect;
}
