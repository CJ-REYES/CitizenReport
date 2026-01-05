import { Dimensions, Platform, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

// Dimensiones estándar
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = size => (width / guidelineBaseWidth) * size;
const verticalScale = size => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Safe area helpers
const getStatusBarHeight = Platform.select({
  ios: 44,
  android: StatusBar.currentHeight,
  default: 0
});

const getBottomSpace = Platform.select({
  ios: 34,
  android: 0,
  default: 0
});

export {
  width,
  height,
  scale,
  verticalScale,
  moderateScale,
  getStatusBarHeight,
  getBottomSpace,
};