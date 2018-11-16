const robot = require('bindings')('robot');

export const Capture = robot.Capture;
export const getClip: () => string = robot.getClip;
export const setClip: (str: string) => void = robot.setClip;
export const getDesktopResolution: () => number[] = robot.getDesktopResolution;
