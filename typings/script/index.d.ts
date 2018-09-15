///<reference path="./lib.es2018.d.ts" />
///<reference types="node" />
///<reference path="./moment.d.ts" />
///<reference path="../shared/index.d.ts" />
import cv = require('opencv4nodejs');
import * as moment from 'moment';
import { VK as DVK } from './vk';

declare global {
    const Mat: typeof cv.Mat;
    const Rect: typeof cv.Rect;
    
    function rect(x, y, w, h): cv.Rect;
    function image(path: string): Image;

    const screenMat: cv.Mat;
    const VK: typeof DVK;
    const MATCH_METHOD_SQDIFF: number;
    const MATCH_METHOD_CCORR: number;
    const MATCH_METHOD_CCOEFF: number;
    const MATCH_METHOD_SQDIFF_NORMED: number;
    const MATCH_METHOD_CCORR_NORMED: number;
    const MATCH_METHOD_CCOEFF_NORMED: number;
    const prop: { [name: string]: PropertyValue };
    var clipboard: string;
    const mousePos: Point;
    const moment: any;
    // const process: NodeJS.Process;
    const cv;

    type Events = 'keydown' | 'keyup' | 'mouseclick' | 'mousedown' | 'mouseup' | 'mousemove' | 'mousedrag' | 'mousewheel';
    type Modifier = 'alt' | 'command' | 'control' | 'shift';

    function exit();
    // function require(path: string): any;
    function print(...args);
    function on(evt: Events, cb: (evt: IOHookEvent) => void);
    function loadImage(path: string): Image;
    function debug(result: Result);

    function random(min: number, max: number);
    
    function type(str: string);
    function typeRaw(str: string, cpm?: number);
    function keyTap(key: string, mod?: Modifier | Modifier[]);

    function untilFound(finder: Finder, timeout?: number, delay?: number): Promise<any>;
    function until(fn: () => boolean | any, timeout?: number, delay?: number): Promise<any>;
    function debugShow(mat?: cv.Mat, window?: string);
    function finder(prop: FindableProperty): Finder;
    function findOne(prop: FindableProperty, matchOptions?: MatchOptions): Result;
    function findMany(prop: FindableProperty, matchOptions?: MultiMatchOptions): IterableIterator<Result>;
    function refresh(block?: number);
    function mouseMove(x?: number, y?: number, options?: MouseMoveOptions);
    function mouseMove(pos: Pos, options?: MouseMoveOptions);
    function mouseMove(prop: FindableProperty, options?: MouseMoveOptions);
    function mouseMoveAsync(x?: number, y?: number, options?: MouseMoveOptions): Promise<any>;
    function mouseMoveAsync(pos: Pos, options?: MouseMoveOptions): Promise<any>;
    function mouseMoveAsync(prop: FindableProperty, options?: MouseMoveOptions): Promise<any>;

    function mouseClick(right?: MouseBClickOptions | cv.Rect);
    function mouseClick(x: number, y: number, right?: MouseBOptions);
    function mouseClick(pos: Pos, right?: MouseBOptions);
    function mouseClick(prop: FindableProperty | cv.Rect, right?: MouseBOptions);

    function mousePress(right?: MouseBClickOptions);
    function mousePress(x: number, y: number, right?: MouseBOptions);
    function mousePress(pos: Pos, right?: MouseBOptions);
    function mousePress(prop: FindableProperty, right?: MouseBOptions);

    function mouseRelease(right?: MouseBClickOptions);
    function mouseRelease(x: number, y: number, right?: MouseBOptions);
    function mouseRelease(pos: Pos, right?: MouseBOptions);
    function mouseRelease(prop: FindableProperty, right?: MouseBOptions);

    function getScreenRGBAt(x, y);
    function getScreenHexAt(x, y);
    function rgbToHex(r, g, b);
    function box(x: number, y: number, w: number, h: number);
    function box(pos: { x: number, y: number, w: number, h: number });
    function box(result: { maxLoc: { x: number, y: number } }, mat: cv.Mat);
    function setTimeout(fn: () => void, timeout?: number);
    function repeat(fn: () => boolean | any, interval?: number);
    function repeatSync(fn: () => boolean | any, interval?: number);
    function delay(millis: number): Promise<any>;

}