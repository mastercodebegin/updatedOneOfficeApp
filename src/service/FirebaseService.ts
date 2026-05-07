import firestore, { addDoc, doc, getDoc, Timestamp, updateDoc } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { getLocalData, setLocalData } from '../utilies/storageService';
import { asyncStorageKeyName } from '../utilies/Constants';
import { getApp } from '@react-native-firebase/app';
import { serverTimestamp } from '@react-native-firebase/firestore';

import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from '@react-native-firebase/firestore';
import { CreateFileInput } from 'src/db/fileLocalService';
import { DateHelper } from '../../src/utilies/DateHelper';

const returnDataHandler = (docSnap: any) => {
  if (!docSnap.exists()) return null;

  const data = docSnap.data();

  return {
    firebaseId: docSnap.id,
    ...data,
    updatedAt: data.updatedAt?.toMillis?.() || 0   // 🔥 important
  };
};

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
      const ref = await addDoc(collection(db, 'folders'), {
        name: folder.name, // folder name
        userId: folder.userId, // user id
        coverUri: folder.coverUri || '', // optional cover
        driveFolderId: folder.driveFolderId || '', // drive id
        updatedAt: serverTimestamp(), // 🔥 important for sync
        isDeleted: 0, // default not deleted
      });

      const docSnap = await getDoc(ref);
      return returnDataHandler(docSnap);


    } catch (error) {
      console.error('❌ createFolderInFirebase error:', error);
      throw error;
    }
  },
  // ✅ UPDATE (for rename, edits)
  async updateFolderInFirebase(folder: any) {
    try {
      const updateData: any = {
        updatedAt: serverTimestamp(), // always required
      };

      // 🔹 only include if present
      if (folder.name !== undefined) {
        updateData.name = folder.name;
      }

      if (folder.isDeleted !== undefined) {
        updateData.isDeleted = folder.isDeleted;
      }

      const ref = doc(db, 'folders', folder.firebaseId); // ✅ create ref

      await updateDoc(ref, updateData);                  // ✅ update

      const docSnap = await getDoc(ref);                 // ✅ fetch

      return returnDataHandler(docSnap);

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
      console.log(' LastsyncTime get:', lastsyncTime);
      const lastsyncTimeNum = Number(lastsyncTime);

      const safeTime = isNaN(lastsyncTimeNum) ? 0 : lastsyncTimeNum;
      const time = Timestamp.fromMillis(safeTime);
      console.log('time>>>>', time);

      const q = query(
        collection(db, 'folders'),
        where('userId', '==', userId),
        where(
          'updatedAt',
          '>',
          time
        ),
        orderBy('updatedAt', 'desc')
      );

      // const q = query(
      //   collection(db, 'folders'),
      //   where('userId', '==', userId),
      //   orderBy('updatedAt', 'desc')
      // );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        firebaseId: doc.id,
        ...doc.data(),
      }));
      return data;
    } catch (e) {
      console.log('❌ Fetch error:', e);
      throw e;
    }
  },
  // ************************ File started*********************
  async createFile(file: CreateFileInput) {
    try {
      const newFile = {
        name: file.name,
        displayName: file.displayName,
        size: file.size || 0,
        lastModified: Date.now(),
        folderId: file.folderId,
        isSynced: 0,
        isDeleted: 0,
        folderFirebaseId: file.folderFirebaseId || '',
        userId: file.userId,
        updatedAt: serverTimestamp(),
        driveFileId: file.driveFileId || '',
      }

      const docRef = await addDoc(collection(db, 'files'), newFile);
      const docSnap = await getDoc(docRef);
      return returnDataHandler(docSnap);


    } catch (error) {
      console.error('❌ createFile error:', error);
      throw error;
    }
  },
  async getUpdatedFilesByUserId() {
    try {
      const userId = getUserId();
      const lastsyncTime = DateHelper.getFirebaseTimeStampByMillis();
      console.log(' getUpdatedFilesByUserId');
      console.log(' LastsyncTime get:', lastsyncTime);
      console.log(' LastsyncTime get:', typeof lastsyncTime);

      const q = query(
        collection(db, 'files'),
        where('userId', '==', userId),
        where(
          'updatedAt',
          '>',
          lastsyncTime
        ),
        orderBy('updatedAt', 'desc')
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        console.log('d======', d);

        return {
          firebaseId: doc.id,
          ...d,
          updatedAt: d.updatedAt?.toMillis?.() || 0   // ✅ convert here
        };
      });
      return data
    }
    catch (e) {
      console.log('❌ Fetch error:', e);
      throw e;
    }
  },

  async updateFileInFirebase(file: any) {
    try {
      const ref = doc(db, 'files', file.firebaseId);

      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (file.name !== undefined) {
        updateData.name = file.name;
      }
      if (file.displayName !== undefined) {
        updateData.displayName = file.displayName;
      }

      if (file.isDeleted !== undefined) {
        updateData.isDeleted = file.isDeleted;
      }

      // 🔥 update
      await updateDoc(ref, updateData);

      // 🔥 fetch updated doc
      const docSnap = await getDoc(ref);

      return returnDataHandler(docSnap);

    } catch (error) {
      console.error('❌ updateFileInFirebase error:', error);
      throw error;
    }
  },

  // async getNewOrUpdatedFolders(lastSyncTime: number) {
  //   try {
  //     const userId = getUserId();

  //     const snapshot = await firestore()
  //       .collection('folders')
  //       .where('userId', '==', userId)
  //       .where('updatedAt', '>', lastSyncTime) // 👈 key change
  //       .get();

  //     const data = snapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));

  //     return data;
  //   } catch (e) {
  //     console.log('❌ Sync error:', e);
  //     throw e;
  //   }
  // },

  // async getNewOrUpdatedFiles(folderId: string, lastSyncTime: number,) {
  //   try {
  //     const userId = getUserId();

  //     const snapshot = await firestore()
  //       .collection('files')
  //       .where('folderId', '==', folderId)
  //       .where('updatedAt', '>', lastSyncTime) // 👈 key change
  //       .get();

  //     const data = snapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));

  //     return data;
  //   } catch (e) {
  //     console.log('❌ Sync files error:', e);
  //     throw e;
  //   }
  // },
  // ✅ DELETE (soft delete)
  async deleteFolder(id: string) {
    try {
      await firestore()
        .collection('folders')
        .doc(id)
        .update({
          isDeleted: 1,
          updatedAt: serverTimestamp(),
        });

      console.log('🗑️ Deleted:', id);
    } catch (e) {
      console.log('❌ Delete error:', e);
      throw e;
    }
  },
};