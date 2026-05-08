// useTheme.ts

import { useSelector, useDispatch } from 'react-redux';
import { darkTheme, lightTheme } from './ThemeConfig';
import { toggleTheme } from './ThemeSlice';
import { StyleProp, TextStyle } from 'react-native';

export const useTheme = () => {
  const mode = useSelector((state) => state.ThemeSlice.mode);
  const dispatch = useDispatch();

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return {
    theme,
    mode,
    isDark: mode === 'dark',
    toggleTheme: () => dispatch(toggleTheme()),
  };
};