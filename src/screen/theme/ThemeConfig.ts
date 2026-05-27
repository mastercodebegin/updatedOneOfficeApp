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
  deleteIconColor:string
};

const commonThemeProperties = {
  commonThemeColor: '#00b6cc',
  deleteIconColor: '#FF3B5C'
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
  bgColor: 'white',
  bgContainor: 'white',
  primaryTextColor: '#000000',
  secondaryTextColor: '#000000',
  iconColor: '#000000',
  borderColor: '#d3d3d3',
  themeColor: '#47b16a',
  buttonBGColor:'#F5F5F5',
  themeSecondaryColor:'#47b16a',
  buttonTextColor:'#000000'
};

export const darkTheme: Theme = {
  ...commonThemeProperties,
  bgColor: '#222222',
  bgContainor: '#1c1c1e',
  primaryTextColor: '#f5f5f5',
  secondaryTextColor: '#808080',
  iconColor: '#f5f5f5',
  borderColor: '#30313A',
  buttonBGColor: '#333333',
  buttonTextColor: '#2a2a2a',
  themeColor: '#47b16a',
  themeSecondaryColor:'#47b16a'

};
