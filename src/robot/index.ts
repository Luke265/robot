import { IOEvent, IOEventType, IOHook } from "../keyboard/iohook";
import { getDesktopResolution, Capture } from "./bindings";
import { CV_8UC3, Mat } from "../cv";
import EventEmitter from "events";

let iohook: IOHook | null = null;
let mat!: Mat;
let instance: Capture | null = null;
const captureEmitter = new EventEmitter();

export function on(evt: IOEventType, cb: (evt: IOEvent) => void): void;
export function on(evt: "capture", cb: (mat: Mat, screen: number) => void): void;
export function on(evt: any, cb: any) {
    if (evt === "capture") {
        captureEmitter.on(evt, cb);
        return;
    }
    if (!iohook) {
        iohook = new IOHook();
        iohook.start();
    }
    iohook.on(evt, cb);
}

export function off(evt: IOEventType, cb: (evt: IOEvent) => void): void;
export function off(evt: "capture", cb: (mat: Mat, screen: number) => void): void;
export function off(evt: any, cb: any) {
    if (evt === "capture") {
        captureEmitter.off(evt, cb);
        return;
    }
    if (!iohook) {
        return;
    }
    iohook.off(evt, cb);
    if (!iohook.hasListeners()) {
        iohook.unload();
        iohook = null;
    }
}

export function lastCapture() {
    return mat;
}

export function capture(screen: number = 0): Mat {
    if (!instance) {
        instance = new Capture();
        const [width, height] = getDesktopResolution();
        mat = new Mat(Math.ceil(height / 8) * 8, Math.ceil(width / 8) * 8, CV_8UC3);
    }
    instance.grab(mat, screen);
    captureEmitter.emit("capture", mat, screen!);
    return mat;
}

export { getClip, setClip, find } from "./bindings";
export { IOEvent } from "../keyboard/iohook";
