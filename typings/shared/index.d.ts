import cvModule = require('opencv4nodejs');

declare global {
    namespace cv {
        type Mat = cvModule.Mat;
        type Rect = cvModule.Rect;
    }
    interface IOHookEvent {
        type: string,
        shiftKey?: boolean,
        altKey?: boolean,
        ctrlKey?: boolean,
        metaKey?: boolean,
        keychar?: number,
        keycode?: number,
        rawcode?: number,
        button?: number,
        clicks?: number,
        x?: number,
        y?: number,
    }
    interface Buffer {

    }
    class Capture {
        constructor();
        grab(mat: cv.Mat, block?: number): boolean;
    }

    type PropertyValue = RectValue | PrimitiveValue | Image | MultiMatchOptions;

    interface Config {
        properties: { [name: string]: PropertyValue }
    }

    interface BasicRect extends cv.Rect {
    }

    interface RectValue extends cv.Rect {
    }

    interface PrimitiveValue {
        type: string;
        value: any;
    }

    interface Image {
        path: string;
        mat: cv.Mat;
    }

    interface MatchOptions {
        source?: cv.Mat;
        targetImage?: Image | string;
        alt?: MatchOptions[];
        region?: cv.Rect | number[];
        lastResult?: Result;
        matchLevel?: number;
        remember?: boolean;
        freeze?: boolean;
        matchMethod?: number;
        amount?: number;
    }

    interface MultiMatchOptions extends MatchOptions {
        flood?: { min: number, max: number };
        treshhold?: { type: number, min: number, max: number };
    }

    interface MouseMoveOptions {
        wind?: number;
        gravity?: number;
        speed?: number;
        point?: Point;
    }

    interface MouseClickOptions {
        button?: MouseButton;
        delay?: number;
        action?: MouseAction;
        position?: Point | cv.Rect;
    }

    interface MouseOptions extends MouseMoveOptions, MouseClickOptions {

    }

    interface Point {
        readonly x: number;
        readonly y: number;
    }

    interface Result{
        x: number;
        y: number;
        width: number;
        height: number;
        value: number;
    }

    interface CVResult {
        maxVal: number;
        minVal: number;
        minLoc: Point;
        maxLoc: Point;
    }

    interface Finder extends MatchOptions {

        findMany(): IterableIterator<Result>;
        find(): Result;
        toResult(match: CVResult, offset?: cv.Rect): Result;
        reset(): void;
    }

    type MouseButton = 'left' | 'right' | 'middle';
    type MouseAction = 'click' | 'press' | 'release';
    type Pos = number[] | Point;
    type Findable = Image | MultiMatchOptions;
    type FindableProperty = Findable | string;
    type MouseBClickOptions = MouseClickOptions | boolean;
    type MouseBOptions = MouseOptions | boolean;
}