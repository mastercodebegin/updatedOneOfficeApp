import { useState,useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { AuthService } from '../service/AuthService';

export const useGoogleAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      // console.log('firebaseUser---',firebaseUser);
      
      setUser(firebaseUser); // ✅ restore user
    } else {
            // console.log('firebaseUser else---',firebaseUser);

      setUser(null);
    }
  });

  return unsubscribe;
}, []);

  const signIn = async () => {
    try {
      setLoading(true);

      const { user, accessToken, idToken } = await AuthService.signIn();

      const googleCredential =
        auth.GoogleAuthProvider.credential(idToken);

      const firebaseUser =
        await auth().signInWithCredential(googleCredential);

      setUser(firebaseUser.user);
      setAccessToken(accessToken);

      return { user: firebaseUser.user, accessToken };
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