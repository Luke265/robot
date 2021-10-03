import { Rect } from './Rect';
import { RotatedRect } from './RotatedRect';
import { Moments } from './Moments';
import { Point2 } from './Point2';
import { Vec4 } from './Vec4';

export class Contour {
  readonly numPoints: number;
  readonly area: number;
  readonly isConvex: boolean;
  readonly hierarchy: Vec4;
  constructor();
  constructor(pts: Point2[]);
  constructor(pts: number[][]);
  approxPolyDP(epsilon: number, closed: boolean): Point2[];
  approxPolyDPContour(epsilon: number, closed: boolean): Contour;
  arcLength(closed?: boolean): number;
  boundingRect(): Rect;
  convexHull(clockwise?: boolean): Contour;
  convexHullIndices(clockwise?: boolean): number[];
  convexityDefects(hullIndices: number[]): Vec4[];
  fitEllipse(): RotatedRect;
  getPoints(): Point2[];
  matchShapes(contour2: Contour, method: number): number;
  minAreaRect(): RotatedRect;
  minEnclosingCircle(): { center: Point2, radius: number };
  minEnclosingTriangle(): Point2[];
  moments(): Moments;
  pointPolygonTest(pt: Point2): number;
}
