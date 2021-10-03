import { Rect } from "../cv";
import { MatchOptions } from "./match-options";

export class Result extends Rect {
    constructor(
        x: number,
        y: number,
        w: number,
        h: number,
        public value: number,
        public matchOptions?: MatchOptions | null
    ) {
        super(x, y, w, h);
    }
}
