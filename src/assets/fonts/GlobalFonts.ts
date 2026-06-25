import { Platform } from 'react-native';

export const Fonts = {
  'bold': 'CrimsonText-Bold',
  'PTSerifBold': 'PTSerif-Bold',
  'CALIBIRI_BOLD': 'calibri_bold',
  'CALIBRI': 'calibri',
  'regular': Platform.select({ android: 'sans-serif', ios: undefined, default: undefined }),
  'PTSerif-Regular': 'PTSerif-Regular',
  'italic': 'PTSerif-Italic'
}
