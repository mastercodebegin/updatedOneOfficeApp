// useResponsive.ts

import { useWindowDimensions } from 'react-native';

const BASE_WIDTH = 360;
const BASE_HEIGHT = 700;

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  const widthFromPercentage = (value: number) => {
    return (width * value) / 100;
  };

  const heightFromPercentage = (value: number) => {
    return (height * value) / 100;
  };

  const scale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);

  const scaledSize = (
    size: number,
    reductionPercentage = 20,
  ) => {
    const value = Math.ceil(size * scale);
    return Math.ceil(value * (1 - reductionPercentage / 100));
  };

  return {
    width,
    height,
    scaledSize,
    widthFromPercentage,
    heightFromPercentage,
  };
};