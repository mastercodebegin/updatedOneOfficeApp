import { createMMKV } from 'react-native-mmkv'

export const storage = createMMKV()

export const setData = (key, value) => {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (e) {
    console.log('MMKV set error:', e);
  }
};

export const getData = (key) => {
  try {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.log('MMKV get error:', e);
    return null;
  }
};

export const removeData = (key) => {
  storage.delete(key);
};