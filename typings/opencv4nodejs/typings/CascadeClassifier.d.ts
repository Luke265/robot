import { Size } from './Size';
import { Mat } from './Mat';
import { Rect } from './Rect';

export class CascadeClassifier {
  constructor(xmlFilePath: string);
  detectMultiScale(img: Mat, scaleFactor?: number, minNeighbors?: number, flags?: number, minSize?: Size, maxSize?: Size): { objects: Rect[], numDetections: number[] };
  detectMultiScaleAsync(img: Mat, scaleFactor?: number, minNeighbors?: number, flags?: number, minSize?: Size, maxSize?: Size): Promise<{ objects: Rect[], numDetections: number[] }>;
  detectMultiScaleGpu(img: Mat, scaleFactor?: number, minNeighbors?: number, flags?: number, minSize?: Size, maxSize?: Size): Rect[];
  detectMultiScaleWithRejectLevels(img: Mat, scaleFactor?: number, minNeighbors?: number, flags?: number, minSize?: Size, maxSize?: Size): { objects: Rect[], rejectLevels: number[], levelWeights: number[] };
  detectMultiScaleWithRejectLevelsAsync(img: Mat, scaleFactor?: number, minNeighbors?: number, flags?: number, minSize?: Size, maxSize?: Size): Promise<{ objects: Rect[], rejectLevels: number[], levelWeights: number[] }>;
}
