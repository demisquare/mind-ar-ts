import resize from './utils/images/resize';
import { ImageDataWithScale } from '../../image-target/utils/types/compiler';

const MIN_IMAGE_PIXEL_SIZE = 100;

// Build a list of image {data, width, height, scale} with different scales
export const buildImageList = (inputImage: ImageData | ImageDataWithScale) => {
  const minScale = MIN_IMAGE_PIXEL_SIZE / Math.min(inputImage.width, inputImage.height);

  const scaleList = [];
  let c = minScale;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    scaleList.push(c);
    c *= Math.pow(2.0, 1.0 / 3.0);
    if (c >= 0.95) {
      c = 1;
      break;
    }
  }

  scaleList.push(c);
  scaleList.reverse();

  const imageList: ImageDataWithScale[] = Array.from(scaleList, (scale) => ({
    ...(resize({ image: inputImage, ratio: scale }) as ImageData),
    scale,
  }));

  return imageList;
};

export const buildTrackingImageList = (inputImage: ImageData | ImageDataWithScale) => {
  const minDimension = Math.min(inputImage.width, inputImage.height);
  const scaleList = [256.0 / minDimension, 128.0 / minDimension];

  const imageList: ImageDataWithScale[] = Array.from(scaleList, (scale) => ({
    ...(resize({ image: inputImage, ratio: scale }) as ImageData),
    scale,
  }));

  return imageList;
};
