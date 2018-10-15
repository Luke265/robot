import { Rect } from "opencv4nodejs";

export class Result extends Rect {

    constructor(x: number, y: number, w: number, h: number, public value: number) {
        super(x, y, w, h);
    }

}