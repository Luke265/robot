import { getDesktopResolution, Capture } from "./bindings";
import { Finder } from '../finder/finder';
import { MatchOptions } from '../finder/match-options';
import { MultiMatchOptions } from '../finder/multi-match-options';
import { Result } from '../finder/result';
import { Robot } from "./robot";
import * as cv from 'opencv4nodejs';

export class Screen {

    mat: cv.Mat;
    capture: any;

    constructor(private context: Robot) {

    }

    refresh() {
        if (!this.capture) {
            this.capture = new Capture();
            const [width, height] = getDesktopResolution();
            this.mat = new cv.Mat(Math.ceil(height / 8) * 8, Math.ceil(width / 8) * 8, cv.CV_8UC3);
        }
        return this.capture.grab(this.mat, 0);
    }

    findMany(options: MultiMatchOptions): IterableIterator<Result> {
        return new Finder(options).findMany();
    }

    findOne(options: MatchOptions): Result {
        return new Finder(options).find();
    }

    async untilFound(finder: Finder, timeout?: number, delay?: number) {
        let result;
        await this.context.whileFn(() => !(result = this.refresh() && finder.find()), timeout, delay);
        return result;
    }

}
