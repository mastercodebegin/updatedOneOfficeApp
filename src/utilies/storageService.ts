import { createMMKV } from 'react-native-mmkv'

export const storage = createMMKV()

export const setLocalData = (key: string, value: any) => {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (e) {
    console.log('MMKV set error:', e);
  }
};

export const getLocalData = (key:string) => {
  try {
    const value = storage.getString(key);
    console.log('getLocalData',value);
    
    return value ;
  } catch (e) {
    console.log('MMKV get error:', e);
    return null;
  }
};

export const removeLocalData = (key:string) => {
return storage.remove(key)
};

export const removeAllLocalData = () => {
return storage.clearAll()
};