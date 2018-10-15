import { Mat, Rect } from "opencv4nodejs";
import { Result } from "./result";

export interface MatchOptions {
    source?: Mat;
    target?: Mat;
    mask?: Mat;
    alt?: MatchOptions[];
    region?: Rect;
    lastResult?: Result;
    matchLevel?: number;
    remember?: boolean;
    freeze?: boolean;
    matchMethod?: number;
    amount?: number;
}