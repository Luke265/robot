import { Size } from './Size';
import { Rect } from './Rect';
import { Point2 } from './Point2';

export class RotatedRect {
  readonly center: Point2;
  readonly size: Size;
  readonly angle: number;
  constructor();
  constructor(center: Point2, size: Size, angle: number);
  boundingRect(): Rect;
}
