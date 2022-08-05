import { Mat, Rect } from "../cv";
import { Result } from "./result";

export interface AltMatchOptions {
    target?: Mat;
    matchLevel?: number;
    matchMethod?: number;
}

export interface MatchOptions extends AltMatchOptions {
    source?: Mat | (() => Mat);
    target?: Mat;
    mask?: Mat;
    alt?: MatchOptions[];
    region?: Rect | null;
    lastResult?: Result | null;
    matchLevel?: number;
    /**
     * Look at the last found area, if not found
     * look everywhere else.
     */
    remember?: boolean;
    /**
     * Increases search area given times, by scaling last found
     * area by {@link autoScalePad}. This only works works
     * when {@link remember} is set to true.
     */
    autoScale?: number;
    /**
     * Search area scaling. Scaling start from the middle of
     * last found area.
     */
    autoScalePad?: number;
    /**
     * Keep looking at the last found area.
     * Manually reset last found area to look everywhere else.
     */
    static?: boolean;
    matchMethod?: number;
    amount?: number;
    flood?: { min: number; max: number };
    treshhold?: { type: number; min: number; max: number };
    startRegion?: Rect | null;
}
