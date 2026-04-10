import { useEffect, useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStorageKeyName } from '../utilies/Constants';
import { getLocalData, setLocalData } from '../utilies/storageService';
import auth from '@react-native-firebase/auth';
interface GoogleUser {
  user: any;
  accessToken: string;
}

export const useGoogleAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
GoogleSignin.configure({
  webClientId: '898961170860-3emi1itrum9s8fk35g6aruqnbqcpfb30.apps.googleusercontent.com',
  scopes: ['https://www.googleapis.com/auth/drive.file'],
  offlineAccess: true,
});
  // const signIn = async (): Promise<GoogleUser | null> => {
  //   try {
  //     setLoading(true);
  //     await GoogleSignin.hasPlayServices();

  //     const userInfo = await GoogleSignin.signIn();
  //     const tokens = await GoogleSignin.getTokens();

  //     // ✅ Use idToken from tokens
  //     const googleCredential = auth.GoogleAuthProvider.credential(
  //       tokens.idToken
  //     );

  //     const firebaseUser = await auth().signInWithCredential(googleCredential);

  //     console.log('🔥 Firebase UID:', firebaseUser.user.uid);

  //     setUser(firebaseUser.user);
  //     setAccessToken(tokens.accessToken);

  //     return {
  //       user: firebaseUser.user,
  //       accessToken: tokens.accessToken,
  //     };

  //   } catch (error: any) {
  //     console.log('Google Sign-In Error:', error);
  //     return null;
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const signIn = async (): Promise<GoogleUser | null> => {
    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      const { idToken } = await GoogleSignin.getTokens();

        //     // ✅ Use idToken from tokens
      const googleCredential = auth.GoogleAuthProvider.credential(
        idToken);

      const firebaseUser = await auth().signInWithCredential(googleCredential);

      console.log('🔥 Firebase UID:', firebaseUser.user.uid);
      console.log('idToken:', idToken); // MUST NOT be undefined
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

  const getFolderId = async (accessToken: string) => {
    try {
      let folderId = getLocalData(asyncStorageKeyName.DRIVE_FOLDER_ID);

      // ✅ If exists → return
      if (folderId) {
        console.log('folderid', folderId);

        return folderId;
      }

      // ❌ If not → create folder
      const res = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "MyAppPhotos",
          mimeType: "application/vnd.google-apps.folder",
        }),
      });

      const data = await res.json();
      console.log('json data=========', data);


      if (!data.id) {
        throw new Error("Folder creation failed");
      }

      folderId = data.id;

      // ✅ Save in MMKV
      setLocalData(asyncStorageKeyName.DRIVE_FOLDER_ID, folderId);

      return folderId;

    } catch (error) {
      console.log("Drive folder error:", error);
      throw error;
    }
  };

  const uploadImage = async (fileUri: string, accessToken: string, folderId: string) => {
    try {
      const metadata = {
        name: `photo_${Date.now()}.jpg`,
        parents: [folderId],
      };

      const formData = new FormData();

      formData.append("metadata", {
        string: JSON.stringify(metadata),
        type: "application/json",
      });

      formData.append("file", {
        uri: fileUri,
        type: "image/jpeg",
        name: "photo.jpg",
      });

      const res = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      console.log("Upload response:", data);

      return data.id;

    } catch (error) {
      console.log("Upload error:", error);
    }
  };

  return {
    user,
    accessToken,
    loading,
    signIn,
    signOut,
    getFolderId,
    uploadImage
  };
};