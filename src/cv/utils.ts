import { Mat, Rect, Vec3 } from ".";

export function isOutOfBounds(mat: Mat, rect: Rect) {
    return rect.x + rect.width >= mat.cols || rect.y + rect.height >= mat.rows;
}

export function scaleRect(rect: Rect, scale: number = 2) {
    let x = rect.x - rect.width / scale;
    let y = rect.y - rect.height / scale;
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
    return new Rect(x, y, rect.width * scale, rect.height * scale);
}

export function hexToVec(hex: string) {
    const bigint = parseInt(hex.substr(1), 16);
    return new Vec3(bigint & 255, (bigint >> 8) & 255, (bigint >> 16) & 255);
}

export function rgbToVec(r: number, g: number = 0, b: number = 0) {
    return new Vec3(b, g, r);
}
