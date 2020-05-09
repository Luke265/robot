import { Point2 } from 'opencv4nodejs';

export interface MinMaxLoc {
    minVal: number;
    maxVal: number;
    minLoc: Point2; 
    maxLoc: Point2;
}