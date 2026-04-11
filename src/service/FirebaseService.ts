import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const getUserId = () => {
  const uid = auth().currentUser?.uid;
  if (!uid) throw new Error('User not logged in');
  return uid;
};

export const FirebaseService = {
  // ✅ CREATE
  async createFolder(name: string) {
    try {
      const userId = getUserId();

      const docRef = await firestore()
        .collection('folders')
        .add({
          name,
          userId,
          updatedAt: Date.now(),
          isDeleted: 0,
        });

      console.log('✅ Created:', docRef.id);
      return docRef.id;
    } catch (e) {
      console.log('❌ Create error:', e);
      throw e;
    }
  },

  // ✅ READ
  async getFolders() {
    try {
      const userId = getUserId();

      const snapshot = await firestore()
        .collection('folders')
        .where('userId', '==', userId)
        .where('isDeleted', '==', 0)
        .orderBy('updatedAt', 'desc')
        .get();

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('📂 Folders:', data);
      return data;
    } catch (e) {
      console.log('❌ Fetch error:', e);
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