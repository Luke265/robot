import { Mat, Rect } from "opencv4nodejs";
import { Result } from "./result";

export interface MatchOptions {
    source?: Mat | (() => Mat);
    target?: Mat;
    mask?: Mat;
    alt?: MatchOptions[];
    region?: Rect;
    lastResult?: Result;
    matchLevel?: number;
    remember?: boolean;
    /*
     * How many times to scale search region before giveup. Default: 1
     */
    autoScale?: number;
    matchMethod?: number;
    amount?: number;
    flood?: { min: number, max: number };
    treshhold?: { type: number, min: number, max: number };
}