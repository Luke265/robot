import { getDesktopResolution, Capture } from "./bindings";
import { CV_8UC3, Mat } from "../cv";

let mat: Mat | null = null;
let instance: Capture | null = null;

export function lastCapture() {
    return mat!;
}

export function capture(screen: number = 0, target?: Mat) {
    if (!instance) {
        instance = new Capture();
        const [width, height] = getDesktopResolution();
        mat = new Mat(Math.ceil(height / 8) * 8, Math.ceil(width / 8) * 8, CV_8UC3);
    }
    return instance.grab(target! || mat!, screen);
}
