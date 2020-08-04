import { Rect, Mat, THRESH_BINARY } from "opencv4nodejs";
import { Result } from "./result";
import { MatchOptions } from "./match-options";
import { Utils } from "../utils";
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

    private _source: Mat | MatSource;

    region: Rect;
    lastResult: Result;
    lastResultRegion: Rect;
    target: Mat;
    matchMethod: number;
    matchLevel: number;
    alt: MatchOptions[];
    remember = false;
    mask: Mat;
    treshhold: Threshold = {
        type: THRESH_BINARY,
        min: 0.5,
        max: 1
    };
    flood: MinMax = {
        min: 0.1,
        max: 1
    };
    startRegion: Rect | null = null;
    autoScale = 1;

    get source(): Mat {
        if (typeof this._source === 'function') {
            return this._source();
        }
        return this._source;
    }

    setSource(source: Mat | (() => Mat)) {
        this._source = source;
    }

    public *findMany() {
        const originalSource = this.source;
        let source: Mat = originalSource;
        if (this.region) {
            source = source.getRegion(this.region);
        }
        let match = source
            .matchTemplate(this.target, this.matchMethod, this.mask)
            .threshold(this.treshhold.min, this.treshhold.max, this.treshhold.type);
        let loc: MinMaxLoc;
        let maxMatches = 10;
        while (maxMatches-- > 0) {
            let minMatches = 1000;
            while (minMatches-- > 0) {
                loc = match.minMaxLoc();
                if (loc.maxVal === 0) {
                    return;
                }
                if (loc.maxVal >= this.matchLevel) {
                    break;
                }
            }
            // matched.floodFill(loc.maxLoc, 0, new Mat(), options.flood.min, options.flood.max, 4);
            yield this.toResult(loc, this.region, this.target, null);
        }
    }

    public find() {
        let originalSource: Mat = this.source;
        let searchSource: Mat = originalSource;
        let region: Rect = this.region;
        if (region) {
            region = this.fixRegion(new Rect(0, 0, originalSource.cols, originalSource.rows), this.region);
            searchSource = originalSource.getRegion(region);
            this.lastResult = null; // temporary
        }
        let source: Mat = searchSource;
        let match: Mat;
        let result: any;
        let searchRegion = region;
        // check if the target is in the last position
        if (this.startRegion && !this.lastResultRegion) {
            this.lastResultRegion = this.startRegion;
        }
        if (this.lastResultRegion) {
            if (!Utils.isOutOfBounds(searchSource, this.lastResultRegion)) {
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
                    return this.toResult(result, searchRegion, this.target, result);
                }
            }
            if (this.alt) {
                for (let alt of this.alt) {
                    if (alt.target.cols > source.cols || alt.target.rows > source.rows) {
                        continue;
                    }
                    const matchLevel = alt.matchLevel || this.matchLevel;
                    match = source.matchTemplate(alt.target, alt.matchMethod || this.matchMethod);
                    result = match.minMaxLoc();
                    if (result.maxVal >= matchLevel) {
                        return this.toResult(result, searchRegion, alt.target, alt);
                    }
                }
            }
            // if target not found in last location then increase the search area
            // only double search if we have a lead
            if (!this.lastResultRegion) {
                break;
            }
            searchRegion = Utils.scaleRect(searchRegion);
            if (Utils.isOutOfBounds(searchSource, searchRegion)) {
                source = searchSource;
                searchRegion = region;
                this.lastResultRegion = this.lastResult = null;
            } else {
                source = searchSource.getRegion(searchRegion);
            }
        }
        this.reset();
    }

    private toResult(match: MinMaxLoc, offset: Rect | null | undefined, target: Mat, matchOptions: MatchOptions): Result {
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
                    if (minWidth < alt.target.cols) {
                        minWidth = alt.target.cols;
                    }
                    if (minHeight < alt.target.rows) {
                        minHeight = alt.target.rows;
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