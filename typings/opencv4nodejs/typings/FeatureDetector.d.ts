import { KeyPointDetector } from './KeyPointDetector';
import { KeyPoint } from './KeyPoint';
import { Mat } from './Mat';

export class FeatureDetector extends KeyPointDetector {
  compute(image: Mat, keypoints: KeyPoint[]): Mat;
  computeAsync(image: Mat, keypoints: KeyPoint[]): Promise<Mat>;
}
