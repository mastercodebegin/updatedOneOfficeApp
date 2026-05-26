import { Platform } from 'react-native';

export const Fonts = {
  'bold': 'CrimsonText-Bold',
  'PTSerifBold': 'PTSerif-Bold',
  'regular': Platform.select({ android: 'sans-serif', ios: undefined, default: undefined }),
  'PTSerif-Regular': 'PTSerif-Regular',
  'italic': 'PTSerif-Italic'

}
