import { Rect } from "opencv4nodejs";
import { MatchOptions } from "./match-options";

export class Result extends Rect {

    constructor(x: number, y: number, w: number, h: number, public value: number, public matchOptions: MatchOptions) {
        super(x, y, w, h);
    }

}