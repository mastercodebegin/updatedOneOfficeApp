import firestore, { addDoc, doc, updateDoc } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { getLocalData, setLocalData } from '../utilies/storageService';
import { asyncStorageKeyName } from '../utilies/Constants';
import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from '@react-native-firebase/firestore';

export const db = getFirestore(getApp());
const getUserId = () => {
  const uid = auth().currentUser?.uid;

  if (!uid) throw new Error('User not logged in');
  return uid;
};

export const FirebaseService = {
  // ✅ CREATE
  async createFolderInFirebase(folder: any) {
    try {
      const docRef = await addDoc(collection(db, 'folders'), {
        name: folder.name, // folder name
        userId: folder.userId, // user id
        coverUri: folder.coverUri || '', // optional cover
        driveFolderId: folder.driveFolderId || '', // drive id
        updatedAt: Date.now(), // 🔥 important for sync
        isDeleted: 0, // default not deleted
      });

      return {
        firebaseId: docRef.id, // return Firebase doc id
      };

    } catch (error) {
      console.error('❌ createFolderInFirebase error:', error);
      throw error;
    }
  },
  // ✅ UPDATE (for rename, edits)
async updateFolderInFirebase(folder: any) {
  try {
    const updateData: any = {
      updatedAt: Date.now(), // always required
    };

    // 🔹 only include if present
    if (folder.name !== undefined) {
      updateData.name = folder.name;
    }

    if (folder.isDeleted !== undefined) {
      updateData.isDeleted = folder.isDeleted;
    }

    await updateDoc(
      doc(db, 'folders', folder.firebaseId),
      updateData
    );

    return true;

  } catch (error) {
    console.error('❌ updateFolderInFirebase error:', error);
    throw error;
  }
},

  // ✅ READ
  async getUpdatedFoldersByUserId() {
    try {
      const userId = getUserId();
      const lastsyncTime = getLocalData(asyncStorageKeyName.LAST_SYNC_TIME)
      console.log(' LastsyncTime get:', typeof lastsyncTime);

      // const q = query(
      //   collection(db, 'folders'),
      //   where('userId', '==', userId),
      //   where('updatedAt', '>', lastsyncTime || 0),
      //   orderBy('updatedAt', 'desc')
      // );
      const q = query(
        collection(db, 'folders'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        firebaseId: doc.id,
        ...doc.data(),
      }));
      const lastSyncTime = Date.now();
      setLocalData(asyncStorageKeyName.LAST_SYNC_TIME, lastSyncTime)
      return data;
    } catch (e) {
      console.log('❌ Fetch error:', e);
      throw e;
    }
  },

  async getNewOrUpdatedFolders(lastSyncTime: number) {
    try {
      const userId = getUserId();

      const snapshot = await firestore()
        .collection('folders')
        .where('userId', '==', userId)
        .where('updatedAt', '>', lastSyncTime) // 👈 key change
        .get();

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return data;
    } catch (e) {
      console.log('❌ Sync error:', e);
      throw e;
    }
  },

  async getNewOrUpdatedFiles(folderId: string, lastSyncTime: number,) {
    try {
      const userId = getUserId();

      const snapshot = await firestore()
        .collection('files')
        .where('folderId', '==', folderId)
        .where('updatedAt', '>', lastSyncTime) // 👈 key change
        .get();

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return data;
    } catch (e) {
      console.log('❌ Sync files error:', e);
      throw e;
    }
  },
  // ✅ DELETE (soft delete)
  async deleteFolder(id: string) {
    try {
      await firestore()
        .collection('folders')
        .doc(id)
        .update({
          isDeleted: 1,
          updatedAt: Date.now(),
        });

      console.log('🗑️ Deleted:', id);
    } catch (e) {
      console.log('❌ Delete error:', e);
      throw e;
    }
  },
};