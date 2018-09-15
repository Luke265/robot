import { Rect, Mat } from "opencv4nodejs";
import { Utils } from "../utils";

export class BindingUtils {

    static isPoint(obj: any) {
        return (Array.isArray(obj) && obj.length >= 2) ||
            (obj.hasOwnProperty('x') && obj.hasOwnProperty('y'));
    }

    static normalizeRegion(rect: any) {
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

    static normalizeImage(data: any) {
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

    static normalizePoint(point: Pos): Point {
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

    static isFindable(obj: any) {
        return obj.hasOwnProperty('mat') ||
            (obj.hasOwnProperty('image') && obj.image.hasOwnProperty('mat'));
    }
    
}