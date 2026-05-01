import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
} from '@react-native-firebase/auth';
import { setLocalData } from '../../src/utilies/storageService';
import { asyncStorageKeyName } from '../../src/utilies/Constants';

// 🔹 Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '898961170860-3emi1itrum9s8fk35g6aruqnbqcpfb30.apps.googleusercontent.com',
  scopes: ['https://www.googleapis.com/auth/drive.file'],
  offlineAccess: true,
});

export const AuthService = {
  // 🔹 Sign In
  async signIn() {
    try {
      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      // 🔥 Connect to Firebase Auth
      const auth = getAuth();
      const credential = GoogleAuthProvider.credential(tokens.idToken);

      const userCredential = await signInWithCredential(auth, credential);

      setLocalData(asyncStorageKeyName.GOOGLE_ACCESS_TOKEN, tokens); // Store tokens for later use
      console.log('✅ Firebase User:', userCredential.user);

      return {
        user: userCredential.user,
        accessToken: tokens.accessToken,
        idToken: tokens.idToken,
      };
    } catch (e) {
      console.log('❌ SignIn Error:', e);
      throw e;
    }
  },

  // 🔹 Sign Out
  async signOut() {
    try {
      const auth = getAuth();

      await firebaseSignOut(auth);     // Firebase logout
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();

      console.log('✅ Signed out');
    } catch (e) {
      console.log('❌ SignOut Error:', e);
      throw e;
    }
  },

  // 🔹 Get Access Token (Google API)
  async getAccessToken() {
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  },

  // 🔹 Get Firebase User ID
  async getUserId() {
    const auth = getAuth();
    return auth.currentUser?.uid || '';
  },

  // 🔹 Refresh Token
  async refreshAccessToken() {
    try {
      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();

      console.log('🔄 Token refreshed');
setLocalData(asyncStorageKeyName.GOOGLE_ACCESS_TOKEN, tokens.accessToken); // Update stored tokens
      return tokens.accessToken;
    } catch (e) {
      console.log('❌ Silent refresh failed → forcing login');

      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
setLocalData(asyncStorageKeyName.GOOGLE_ACCESS_TOKEN, tokens.accessToken); // Update stored tokens

      return tokens.accessToken;
    }
  },
};