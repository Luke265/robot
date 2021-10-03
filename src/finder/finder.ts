import { Rect, Mat, THRESH_BINARY, TM_CCOEFF_NORMED, Point2 } from "../cv";
import { Result } from "./result";
import { MatchOptions } from "./match-options";
import { isOutOfBounds, scaleRect } from "../cv/utils";
import { MinMaxLoc } from "./min-max-loc";

export interface MatSource {
    (): Mat;
}
export interface MinMax {
    min: number;
    max: number;
}
export interface Threshold extends MinMax {
    type: number;
}
export class Finder {
    private _source!: Mat | MatSource;

    region?: Rect | null;
    lastResult: Result | null = null;
    lastResultRegion: Rect | null = null;
    target!: Mat;
    matchMethod: number = TM_CCOEFF_NORMED;
    matchLevel: number = 0.98;
    alt?: MatchOptions[];
    remember = false;
    mask?: Mat;
    startRegion: Rect | null = null;
    autoScale = 1;

    get source(): Mat {
        if (typeof this._source === "function") {
            return this._source();
        }
        return this._source;
    }

    setSource(source: Mat | (() => Mat)) {
        this._source = source;
    }

    public find() {
        let originalSource: Mat = this.source;
        let searchSource: Mat = originalSource;
        let region: Rect | undefined | null = this.region;
        if (region) {
            region = this.fixRegion(new Rect(0, 0, originalSource.cols, originalSource.rows), region);
            searchSource = originalSource.getRegion(region);
            this.lastResult = null; // temporary
        }
        let source: Mat = searchSource;
        let match: Mat;
        let result: MinMaxLoc | null = null;
        let searchRegion = region;
        // check if the target is in the last position
        if (this.startRegion && !this.lastResultRegion) {
            this.lastResultRegion = this.startRegion;
        }
        if (this.lastResultRegion) {
            if (!isOutOfBounds(searchSource, this.lastResultRegion)) {
                searchRegion = this.lastResultRegion;
                source = searchSource.getRegion(this.lastResultRegion);
            }
        }
        for (let i = 0; i < this.autoScale; i++) {
            if (source.cols >= this.target.cols && source.rows >= this.target.rows) {
                if (this.mask) {
                    match = source.matchTemplate(this.target, this.matchMethod, this.mask);
                } else {
                    match = source.matchTemplate(this.target, this.matchMethod);
                }
                result = match.minMaxLoc();
                if (result.maxVal >= this.matchLevel) {
                    return this.toResult(result, searchRegion, this.target);
                }
            } else if (i === 0) {
                throw new Error(
                    `Source (${source.cols}x${source.rows}) is smaller than target (${this.target.cols}x${this.target.rows})`
                );
            }
            if (this.alt) {
                for (let alt of this.alt) {
                    const target = alt.target;
                    if (!target || target.cols > source.cols || target.rows > source.rows) {
                        continue;
                    }
                    const matchLevel = alt.matchLevel || this.matchLevel;
                    match = source.matchTemplate(target, alt.matchMethod || this.matchMethod);
                    result = match.minMaxLoc();
                    if (result.maxVal >= matchLevel) {
                        return this.toResult(result, searchRegion, target, alt);
                    }
                }
            }
            // if target not found in last location then increase the search area
            // only double search if we have a lead
            if (!this.lastResultRegion) {
                break;
            }
            if (searchRegion && i + 1 < this.autoScale) {
                searchRegion = scaleRect(searchRegion);
                if (isOutOfBounds(searchSource, searchRegion)) {
                    source = searchSource;
                    searchRegion = region;
                    this.lastResultRegion = this.lastResult = null;
                } else {
                    source = searchSource.getRegion(searchRegion);
                }
            }
        }
        this.reset();
    }

    private toResult(
        match: MinMaxLoc,
        offset: Rect | null | undefined,
        target: Mat,
        matchOptions?: MatchOptions | null
    ): Result {
        const result = new Result(
            match.maxLoc.x + (offset ? offset.x : 0),
            match.maxLoc.y + (offset ? offset.y : 0),
            target.cols,
            target.rows,
            match.maxVal,
            matchOptions
        );
        if (this.remember) {
            if (this.alt && this.alt.length > 0) {
                let minWidth = this.target.cols;
                let minHeight = this.target.rows;
                for (let alt of this.alt) {
                    const target = alt.target;
                    if (target) {
                        if (minWidth < target.cols) {
                            minWidth = target.cols;
                        }
                        if (minHeight < target.rows) {
                            minHeight = target.rows;
                        }
                    }
                }
                this.lastResultRegion = new Rect(match.maxLoc.x, match.maxLoc.y, minWidth, minHeight);
            } else {
                this.lastResultRegion = result;
            }
            this.lastResult = result;
        } else {
            this.reset();
        }
        return result;
    }

    private fixRegion(outer: Rect, inner: Rect) {
        let { x, y, width, height } = inner;
        x = Math.max(0, x);
        y = Math.max(0, y);
        let diff = outer.width - x - width;
        if (diff <= 0) {
            x += diff - 1;
        }
        diff = outer.height - y - height;
        if (diff <= 0) {
            y += diff - 1;
        }
        return new Rect(x, y, width, height);
    }

    reset() {
        this.lastResult = null;
        this.lastResultRegion = null;
    }
}
