import { Mat } from "../opencv4nodejs/types";

export class Capture {
    grab(mat: Mat, screen: number);
}

export class Tesseract {
    constructor(path: string);
    read(image: Mat): { word: string, confidence: number, box: Rect }[];
    clear();
}

export function getClip(): string;
export function setClip(content: string): void;
export function getDesktopResolution(): [number, number];