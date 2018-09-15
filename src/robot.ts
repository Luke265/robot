const robot = require('bindings')('robot');

declare class ICapture {
    Capture();
    grab(mat: cv.Mat, block?: number);
}
export const Capture: typeof ICapture = robot.Capture;
export const getClip: () => string = robot.getClip;
export const setClip: (str: string) => void = robot.setClip;
export const getDesktopResolution: () => number[] = robot.getDesktopResolution;
