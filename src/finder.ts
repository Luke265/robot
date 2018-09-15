import { Rect, Mat, THRESH_BINARY, FILLED, LINE_8, Vec3 } from "opencv4nodejs";
import { Utils } from "./utils";

export class Finder {

    lastResult: Result;
    lastResultRegion: Rect;
    source: Mat | (() => Mat);
    region: Rect;
    targetImage: Image;
    matchMethod: number;
    matchLevel: number;
    alt: MatchOptions[];
    remember = true;
    freeze = false;
    treshhold = {
        type: THRESH_BINARY,
        min: 0.5,
        max: 1
    };
    flood = {
        min: 0.1,
        max: 1
    }

    public *findMany() {
        const originalSource = this.source instanceof Mat ? this.source : this.source();
        let source: Mat = originalSource;
        if (this.region) {
            source = source.getRegion(this.region);
        }
        let match = source
            .matchTemplate(this.targetImage.mat, this.matchMethod)
            .threshold(this.treshhold.min, this.treshhold.max, this.treshhold.type);
        let loc;
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
            match.drawRectangle(
                new Rect(loc.x, loc.y, loc.w, loc.h),
                new Vec3(0, 255, 0),
                FILLED,
                LINE_8
            );
            // matched.floodFill(loc.maxLoc, 0, new Mat(), options.flood.min, options.flood.max, 4);
            yield this.toResult(loc, this.region);
        }
    }

    public find() {
        let originalSource = this.source instanceof Mat ? this.source : this.source();
        if (this.region) {
            originalSource = originalSource.getRegion(this.region);
            this.lastResult = null; // temporary
        }
        let source: Mat = originalSource;
        let match;
        let result;
        let region: Rect = this.region;
        let scalingAttempts = 1;
        // check if the target is in the last position
        if (this.lastResultRegion) {
            region = <any>this.lastResultRegion;
            if (!this.freeze) {
                scalingAttempts = 10;
            }
            //rectangle = new Rect(options.lastResult.x, options.lastResult.y, options.lastResult.width, options.lastResult.height);
            /* if (rectangle.width < 100 || rectangle.height < 100) {
                 const width =  (100 + Math.min(0, source.cols - (rectangle.x + rectangle.width))) / 2;
                 const height = (100 + Math.min(0, source.rows - (rectangle.y + rectangle.height))) / 2;
                 const x = rectangle.x - width;
                 const y = rectangle.y - height;
                 rectangle = new Rect(Math.max(0, x), Math.max(0, y), width - Math.min(0, x), height - Math.min(0, y));
                 console.log('Min Rectangle: ', rectangle.x, rectangle.y, rectangle.width, rectangle.height);
             }*/
            if (this.region) {
                 region = new Rect(
                     region.x - this.region.x,
                     region.y - this.region.y,
                     region.width,
                     region.height
                 )
             }
            //console.log('Getting region', region.x, region.y, region.width, region.height);
            source = source.getRegion(region);
        }
        for (let i = 0; i < scalingAttempts; i++) {
            /*if (rectangle) {
                options.source.drawRectangle(
                    rectangle,
                    new cv.Vec3(255, 0, 0),
                    2,
                    cv.LINE_8
                );
            }*/
            match = source.matchTemplate(this.targetImage.mat, this.matchMethod);
            result = match.minMaxLoc();
            if (result.maxVal >= this.matchLevel) {
                return this.toResult(result, region);
            }
            // if target not found in last location then double search area
            if (!this.lastResultRegion) {
                return;
            }
            if (this.alt) {
                for (let alt of this.alt) {
                    const matchLevel = alt.matchLevel || this.matchLevel;
                    match = source.matchTemplate((<any>alt.targetImage).mat, alt.matchMethod || this.matchMethod);
                    result = match.minMaxLoc();
                    if (result.maxVal >= matchLevel) {
                        console.log('Alternative result');
                        return this.toResult(result, region);
                    }
                }
            }
            region = Utils.scaleRect(region);
            // console.log('Scaled: ', rectangle.x, rectangle.y, rectangle.width, rectangle.height);
            if (Utils.isOutOfBounds(originalSource, region)) {
                source = originalSource;
                region = null;
                this.lastResultRegion = this.lastResult = null;
            } else {
                source = originalSource.getRegion(region);
            }
        }
    }

    toResult(match: CVResult, offset?: Rect): Result {
        const region = new Rect(
            match.maxLoc.x + (offset ? offset.x : 0),
            match.maxLoc.y + (offset ? offset.y : 0),
            this.targetImage.mat.cols,
            this.targetImage.mat.rows
        );
        const result = {
            x: region.x,
            y: region.y,
            width: region.width,
            height: region.height,
            value: match.maxVal
        };
        if (this.remember) {
            this.lastResultRegion = region;
            this.lastResult = result;
        } else {
            this.reset();
        }
        return result;
    }

    reset() {
        this.lastResult = null;
        this.lastResultRegion = null;
    }

}