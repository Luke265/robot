import { Mat } from "../opencv4nodejs/types";

export class Capture {
    grab(mat: Mat, screen: number);
}

export enum PageSegMode {
    PSM_OSD_ONLY = 0,
    PSM_AUTO_OSD = 1,
    PSM_AUTO_ONLY = 2,
    PSM_AUTO = 3,
    PSM_SINGLE_COLUMN = 4,
    PSM_SINGLE_BLOCK_VERT_TEXT = 5,
    PSM_SINGLE_BLOCK = 6,
    PSM_SINGLE_LINE = 7,
    PSM_SINGLE_WORD = 8,
    PSM_CIRCLE_WORD = 9,
    PSM_SINGLE_CHAR = 10,
    PSM_SPARSE_TEXT = 11,
    PSM_SPARSE_TEXT_OSD = 12,
    PSM_RAW_LINE = 13,
    PSM_COUNT = 14,
}

export class Tesseract {
    constructor(path: string);
    setImage(image: Mat): void;
    recognize(): void;
    getText(): string;
    getBoxes(): { word: string, confidence: number, box: Rect }[];
    setPageSegMode(mode: PageSegMode): void;
    setSourceResolution(resolution: number): void;
    clear();
}

export function getClip(): string;
export function setClip(content: string): void;
export function getDesktopResolution(): [number, number];