import { Dimensions, PixelRatio, Platform } from 'react-native';
import { responsiveWidth } from 'react-native-responsive-dimensions';

export let screenWidth = Dimensions.get('window').width;
export let screenHeight = Dimensions.get('window').height;
//Artboard Dimension
let artBoardHeightOrg = 844;
let artBoardWidthOrg = 390;
//Re calculated Artboard Dimension
let artBoardWidth = isSameRatio() ? artBoardWidthOrg : screenWidth;
let artBoardHeight = isSameRatio() ? artBoardHeightOrg : screenHeight;
// To check if Artboard and Device screen has same ratio
function isSameRatio(): boolean {
  return (
    artBoardWidthOrg / artBoardHeightOrg < 1 && screenWidth / screenHeight < 1
  );
}

//Top or Bottom nav spaces or any extra space occupied by os e.g Status bar, Notch
let extraSpace = 0;

export function deviceBasedDynamicDimension(
  originalDimen: number,
  compareWithWidth: boolean,
  resizeFactor: number
): number | undefined {
  if (originalDimen != null) {
    if (resizeFactor != null) {
      originalDimen *= resizeFactor;
    }
    const compareArtBoardDimenValue = compareWithWidth
      ? artBoardWidth
      : artBoardHeight;
    const artBoardScreenDimenRatio =
      (originalDimen * 100) / compareArtBoardDimenValue;
    let compareCurrentScreenDimenValue = compareWithWidth
      ? screenWidth
      : screenHeight - extraSpace;
    if (Platform.OS === 'web') {
      return (
        responsiveWidth(originalDimen / compareCurrentScreenDimenValue) * 100
      );
    }
    return PixelRatio.roundToNearestPixel(
      (artBoardScreenDimenRatio * compareCurrentScreenDimenValue) / 100
    );
  }
  // return null;
}
