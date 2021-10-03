import { Point2 } from './Point2';

export class KeyPoint {
  readonly pt: Point2;
  readonly size: number;
  readonly angle: number;
  readonly response: number;
  readonly octave: number;
  readonly class_id: number;
  readonly localId: number;
  constructor(point: Point2, size: number, angle: number, response: number, octave: number, class_id: number);
}
