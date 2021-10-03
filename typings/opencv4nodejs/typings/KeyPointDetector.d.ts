import { KeyPoint } from './KeyPoint';
import { Mat } from './Mat';

export class KeyPointDetector {
  detect(image: Mat): KeyPoint[];
  detectAsync(image: Mat): Promise<KeyPoint[]>;
}
