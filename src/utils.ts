import { Mat, Rect, Vec3 } from "opencv4nodejs";

export class Utils {

    public static random(num: number, max?: number) {
        if (max === undefined) {
            return Math.random() * num;
        }
        return Math.random() * (max - num) + num;
    }

    public static isOutOfBounds(mat: Mat, rect: Rect) {
        return (rect.x + rect.width) >= mat.cols || (rect.y + rect.height) >= mat.rows;
    }

    public static scaleRect(rect: Rect, scale: number = 2) {
        let x = rect.x - (rect.width / scale);
        let y = rect.y - (rect.height / scale);
        if (x < 0) {
            x = 0;
        } else {
            x = Math.round(x);
        }
        if (y < 0) {
            y = 0;
        } else {
            y = Math.round(y);
        }
        return new Rect(
            x,
            y,
            rect.width * scale,
            rect.height * scale
        );
    }

    public static componentToHex(c) {
        return c.toString(16).padStart(2, '0');
    }

    public static rgbToHex(r: number, g: number, b: number) {
        return "#" + Utils.componentToHex(r) + Utils.componentToHex(g) + Utils.componentToHex(b);
    }

    public static hexToVec(hex: string) {
        const bigint = parseInt(hex.substr(1), 16);
        return new Vec3(bigint & 255, (bigint >> 8) & 255, (bigint >> 16) & 255);
    }

    public static rgbToVec(r: number, g: number = 0, b: number = 0) {
        return new Vec3(b, g, r);
    }

}