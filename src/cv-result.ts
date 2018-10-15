import { Point2 } from "opencv4nodejs";

export interface CVResult {
    maxVal: number;
    minVal: number;
    minLoc: Point2;
    maxLoc: Point2;
}