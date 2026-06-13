// theme.ts

import { COLORS } from "../../utilies/GlobalColors";

export type Theme = {
  bgColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  iconColor?: string; // optional for future use
  bgContainor?: string; // optional for future use
  borderColor: string; // optional for future use
  themeColor: string; // optional for future use
  buttonBGColor?: string; // optional for future use
  secondaryButtonBGColor?: string; // optional for future use
  themeSecondaryColor:string,
  buttonTextColor:string,
  deleteIconColor:string,
  favColor?:string
};

const commonThemeProperties = {
  themeColor: '#0081A7',
  deleteIconColor: '#FF3B5C',
  favColor:'#F4C542'
}
// export const lightTheme: Theme = {
//   ...commonThemeProperties,
//   bgColor: 'white',
//   bgContainor: '#f5f6fa',
//   primaryTextColor: '#000000',
//   secondaryTextColor: 'white',
//   iconColor: '#0081A7',
//   borderColor: '#e0e0e0',
//   themeColor: '#0081A7',
//   buttonBGColor:'#f5f5f5',
//   themeSecondaryColor:'#00B4D8'
// };
export const lightTheme: Theme = {
  ...commonThemeProperties,
  bgColor: '#ECECEC',
  bgContainor: '#F5F5F7',
  primaryTextColor: '#000000',
  secondaryTextColor: '#000000',
  iconColor: '#6B7280',
  borderColor: '#d3d3d3',
  // themeColor: '#47b16a',
  buttonBGColor:'#F5F5F5',
  themeSecondaryColor:'#47b16a',
  buttonTextColor:'#000000'
};

export const darkTheme: Theme = {
  ...commonThemeProperties,
  bgColor: '#1a1d27',
  bgContainor: '#0E1015',

  // Text
  primaryTextColor: '#F5F5F7',
  secondaryTextColor: '#8E8E93',

  // Icons
  iconColor: '#F5F5F7',

  // Borders
  borderColor: '#32343A',

  // Buttons / chips
  buttonBGColor: '#2C2C2E',
  buttonTextColor: '#F5F5F7',

  // Accent
  themeSecondaryColor: '#00B7EB',

};
