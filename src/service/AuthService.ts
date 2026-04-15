import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

GoogleSignin.configure({
  webClientId: '898961170860-3emi1itrum9s8fk35g6aruqnbqcpfb30.apps.googleusercontent.com',
  scopes: ['https://www.googleapis.com/auth/drive.file'],
  offlineAccess: true,
});

export const AuthService = {
  async signIn() {
    await GoogleSignin.hasPlayServices();

    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();

    console.log('userInfo======',userInfo);
    
    return {
      user: userInfo,
      accessToken: tokens.accessToken,
      idToken: tokens.idToken,
    };
  },

  async signOut() {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
  },

  async getAccessToken() {
    const tokens = await GoogleSignin.getTokens();
    // console.log('token',tokens);
    
    return tokens.accessToken;
  },
  async getUserId  () {
  return auth().currentUser?.uid || '';
},

  async refreshAccessToken() {
    try {
      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();

      console.log('🔄 Token refreshed');

      return tokens.accessToken;
    } catch (e) {
      console.log('❌ Silent refresh failed → forcing login');

      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      return tokens.accessToken;
    }
  }
};