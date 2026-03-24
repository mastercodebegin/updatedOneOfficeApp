import { useEffect, useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface GoogleUser {
  user: any;
  accessToken: string;
}

export const useGoogleAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '955297173470-mh58cg7jfquem59qaj1sh3mhtrat8a15.apps.googleusercontent.com',
      scopes: ['https://www.googleapis.com/auth/drive.file'],
      offlineAccess: true,
    });
  }, []);

  const signIn = async (): Promise<GoogleUser | null> => {
    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
console.log('tokens---',tokens);
console.log('userInfo---',userInfo);

      setUser(userInfo);
      setAccessToken(tokens.accessToken);

      return {
        user: userInfo,
        accessToken: tokens.accessToken,
      };

    } catch (error: any) {
      console.log('Google Sign-In Error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

const signOut = async () => {
  try {
    await GoogleSignin.revokeAccess(); // optional
    await GoogleSignin.signOut();

    setUser(null);
    setAccessToken(null);
  } catch (error) {
    console.log('Sign out error:', error);
  }
};

  return {
    user,
    accessToken,
    loading,
    signIn,
    signOut,
  };
};