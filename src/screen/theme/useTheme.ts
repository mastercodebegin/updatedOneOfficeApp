// useTheme.ts

import { useSelector, useDispatch } from 'react-redux';
import { darkTheme, lightTheme } from './ThemeConfig';
import { toggleTheme } from './ThemeSlice';

export const useTheme = () => {
  const mode = useSelector(
    (state: any) => state.ThemeSlice.mode,
  );

  const dispatch = useDispatch();

  console.log('mode inside hook', mode);

  const theme =
    mode === 'dark'
      ? darkTheme
      : lightTheme;

  console.log('selectedTheme', theme);

  return {
    theme,
    mode,
    isDark: mode === 'dark',
    toggleTheme: () => dispatch(toggleTheme()),
  };
};