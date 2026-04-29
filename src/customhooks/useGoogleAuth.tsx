import { useState, useEffect } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from '@react-native-firebase/auth';
import { AuthService } from '../service/AuthService';

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

      const auth = getAuth();

      const credential = GoogleAuthProvider.credential(idToken);

      const firebaseUser = await signInWithCredential(auth, credential);

      setUser(firebaseUser.user);
      setAccessToken(accessToken);

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