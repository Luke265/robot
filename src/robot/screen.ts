import { getDesktopResolution, Capture } from "./bindings";
import { Finder } from '../finder/finder';
import { Robot } from "./robot";
import * as cv from 'opencv4nodejs';
import { Result } from "../finder/result";
import { Mat } from "opencv4nodejs";

export class Screen {

    mat: cv.Mat;
    capture: any;

    constructor(private context: Robot) {

    }

    refresh(screen: number = 0, mat?: Mat) {
        if (!this.capture) {
            this.capture = new Capture();
            const [width, height] = getDesktopResolution();
            this.mat = new cv.Mat(Math.ceil(height / 8) * 8, Math.ceil(width / 8) * 8, cv.CV_8UC3);
        }
        return this.capture.grab(mat || this.mat, screen);
    }

    async untilFound(finder: Finder, timeout?: number, delay?: number) {
        let result: Result;
        await this.context.whileFn(() => {
            this.refresh();
            result = finder.find();
            return !result;
        }, timeout, delay);
        return result;
    }

}
