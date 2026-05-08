// themeSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { getLocalData, setLocalData } from '../../utilies/storageService';
import { asyncStorageKeyName } from '../../utilies/Constants';

const getInitialMode = () => {
  const mode= getLocalData(asyncStorageKeyName.THEME_MODE) ;
  console.log('mode',mode);
  return mode?JSON.parse(mode):'light';
};

const initialState = {
  mode: getInitialMode(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const newMode = state.mode === 'dark' ? 'light' : 'dark';
      state.mode = newMode;

      // persist immediately
      setLocalData(asyncStorageKeyName.THEME_MODE, newMode);  // 🔥 important for sync
    },
  },
});

export default themeSlice.reducer;
export const { toggleTheme } = themeSlice.actions;