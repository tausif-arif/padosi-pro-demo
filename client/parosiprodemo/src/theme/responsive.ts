import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

/** Reference device every scale is computed against (iPhone X class, 375x812). */
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size: number) => (width / guidelineBaseWidth) * size;

const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

/** Interpolates between a fixed size and the scaled one, so layout shifts stay subtle. */
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

const moderateScaleVertical = (size: number, factor = 0.5) =>
  size + (verticalScale(size) - size) * factor;

/**
 * Sizes type off screen height, not width, so long words wrap at the same
 * ratio everywhere. Absolute-ratio phones (18.5:9 and taller) get a smaller
 * factor, otherwise text grows far too large.
 */
const textScale = (percent: number) => {
  if (Platform.OS === 'web') return percent;
  const ratio = height / width;
  const deviceHeight = height * (ratio > 1.8 ? 0.126 : 0.15);

  return Math.round((percent * deviceHeight) / 100);
};

export { scale, verticalScale, textScale, moderateScale, moderateScaleVertical, width, height };
