import { createMMKV } from 'react-native-mmkv'

export const storage = createMMKV()

export const setLocalData = (key: string, value: any) => {
  try {
    if(value)
    {
      storage.set(key, JSON.stringify(value));
    }
  } catch (e) {
    console.log('MMKV set error:', e);
  }
};

export const getLocalData = (key:string) => {
try {
  const value = storage.getString(key);

  return value
    ? JSON.parse(value)
    : null;

} catch (error) {
  console.log(error);
  return null;
}
};

export const removeLocalData = (key:string) => {
return storage.remove(key)
};

export const removeAllLocalData = () => {
return storage.clearAll()
};