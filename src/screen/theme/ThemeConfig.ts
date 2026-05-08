// theme.ts

export type Theme = {
  bgColor: string;
  textColor: string;
  iconColor?: string; // optional for future use
  bgContainor?: string; // optional for future use
  borderColor?: string; // optional for future use
};

export const lightTheme: Theme = {
  bgColor: '#ffffff',
  textColor: '#000000',
  iconColor: '#47b16a',
  bgContainor: '#f0f0f0',
  borderColor: '#e0e0e0',
};

export const darkTheme: Theme = {
  bgColor: '#222222',
  textColor: '#ffffff',
  iconColor: '#47b16a',
  bgContainor: '#1c1c1e',
  borderColor: '#262730',
};