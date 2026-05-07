import { useState, useEffect } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from '@react-native-firebase/auth';
import { AuthService } from '../service/AuthService';
import { setLocalData } from '../../src/utilies/storageService';
import { asyncStorageKeyName } from '../../src/utilies/Constants';

export const useGoogleAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);

      const { accessToken, idToken } = await AuthService.signIn();
      console.log('accessToken signIn -------- :', accessToken);
      console.log('idToken signIn----------------:', idToken);

      const auth = getAuth();

      const credential = GoogleAuthProvider.credential(idToken);

      const firebaseUser = await signInWithCredential(auth, credential);

      setUser(firebaseUser.user);
      setAccessToken(accessToken);
      setLocalData(asyncStorageKeyName.GOOGLE_ACCESS_TOKEN, accessToken); // Store token in storage

      return { user: firebaseUser.user, accessToken };
    } catch (e) {
      console.log('SignIn error:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await AuthService.signOut();
    setUser(null);
    setLocalData(asyncStorageKeyName.GOOGLE_ACCESS_TOKEN, ''); // Clear token from storage
    setAccessToken('');
  };

  return {
    user,
    accessToken,
    loading,
    signIn,
    signOut,
  };
};