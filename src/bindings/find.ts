import { Utils } from "../utils";
import { Bind } from '../script-bindings';
import * as cv from 'opencv4nodejs';
import { Mat, Rect } from "opencv4nodejs";
import { Finder } from "../finder";
import { PropertyParsers } from "../config";
import { CoreBindings } from "./core";
import { Script } from "../script";

@Bind()
export class FindBindings {

    @Bind()
    MATCH_METHOD_SQDIFF = cv.TM_SQDIFF;

    @Bind()
    MATCH_METHOD_CCORR = cv.TM_CCORR;

    @Bind()
    MATCH_METHOD_CCOEFF = cv.TM_CCOEFF;

    @Bind()
    MATCH_METHOD_SQDIFF_NORMED = cv.TM_SQDIFF_NORMED;

    @Bind()
    MATCH_METHOD_CCORR_NORMED = cv.TM_CCORR_NORMED;

    @Bind()
    MATCH_METHOD_CCOEFF_NORMED = cv.TM_CCOEFF_NORMED;

    constructor(private coreBindings: CoreBindings, private script: Script) {
    }

    @Bind()
    findMany(prop: Findable | string, options?: MultiMatchOptions) {
        return this.finder(prop, options).findMany();
    }

    @Bind()
    findOne(prop: Findable | string, options?: MatchOptions) {
        return this.finder(prop, options).find();
    }

    @Bind()
    finder(prop: Findable | string, options?: MatchOptions) {
        if (typeof prop === 'string') {
            switch (prop.substr(-4)) {
                case '.png':
                case '.jpg':
                case '.bmp':
                    prop = PropertyParsers.Image(prop, this.script.dir);
                    break;
                default:
                    const propName = prop;
                    prop = this.coreBindings.property(propName) as any;
                    if (!prop) {
                        throw new Error(`Property ${propName} not found.`);
                    }
                    break;
            }
        }
        options = options || {};
        const finder = new Finder();
        finder.source = options.source || (<any>prop).source || this.coreBindings.matFn;
        finder.matchLevel = options.matchLevel || (<any>prop).matchLevel || 0.98;
        finder.matchMethod = options.matchMethod || (<any>prop).matchMethod || cv.TM_CCORR_NORMED;
        finder.targetImage = this.normalizeImage(options.targetImage || (<any>prop).targetImage || prop);
        finder.alt = options.alt || (<any>prop).alt;
        finder.region = this.normalizeRegion(options.region || (<any>prop).region);
        finder.freeze = options.freeze || finder.freeze;
        finder.remember = options.remember || finder.remember;
        return finder;
    }

    @Bind()
    async untilFound(finder: Finder, timeout?: number, delay?: number) {
        let result;
        await this.coreBindings.until(() => {
            this.coreBindings.refresh();
            return result = finder.find();
        }, timeout, delay);
        return result;
    }


    isPoint(obj: any) {
        return (Array.isArray(obj) && obj.length >= 2) ||
            (obj.hasOwnProperty('x') && obj.hasOwnProperty('y'));
    }

    normalizeRegion(rect: any) {
        if (!rect) {
            return null;
        }
        if (rect instanceof Rect) {
            return rect;
        }
        if (Array.isArray(rect)) {
            return new Rect(rect[0], rect[1], rect[2], rect[3]);
        }
        if (typeof rect.x !== 'number' || typeof rect.y !== 'number' || typeof rect.width !== 'number' || typeof rect.height !== 'number') {
            throw new Error('Invalid rectangle');
        }
        return new Rect(rect.x, rect.y, rect.width, rect.height);
    }

    normalizeImage(data: any) {
        if (!data) {
            return null;
        }
        if (data instanceof Mat) {
            return { path: null, mat: data };
        }
        if (data.mat) {
            return data;
        }
        throw new Error('Invalid image');
    }

    normalizePoint(point: Pos): Point {
        if (Array.isArray(point)) {
            const result = { x: point[0], y: point[1] };
            if (point.length === 4) {
                const rectPoint = Utils.randomPointInRect(new Rect(point[0], point[1], point[2], point[3]));
                result.x += rectPoint.x;
                result.y += rectPoint.y;
            }
            return result;
        } else if (point.hasOwnProperty('width') && point.hasOwnProperty('height')) {
            const rectPoint = Utils.randomPointInRect(<Rect>point);
            return {
                x: (<Point>point).x + rectPoint.x,
                y: (<Point>point).y + rectPoint.y
            }
        }
        return <Point>point;
    }

}