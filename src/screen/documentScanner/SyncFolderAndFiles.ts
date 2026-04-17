  
  import { getLocalData, removeLocalData, setLocalData } from '../../utilies/storageService';
import { FolderLocalService, resetFoldersTable } from '../../db/folderLocalService';
import { DateHelper } from '../../utilies/DateHelper';
import { FileLocalService } from '../../db/fileLocalService';
import { FirebaseService } from '../../service/FirebaseService';
import { GoogleDriveService } from '../../db/googleDriveService';
import { AuthService } from '../../service/AuthService';
import { useGoogleAuth } from '../../customhooks/useGoogleAuth';
import { asyncStorageKeyName, CONSTANT, DateFormat } from '../../utilies/Constants';

  
  export const syncAll = async () => {

    const folders = await syncFirebaseToLocal()
    console.log('Synced folders:', folders);
    
    return folders;

  }
  const syncFirebaseToLocal = async () => {
    // resetFoldersTable()
    //     const lastSyncTime =  getLocalData(asyncStorageKeyName.LAST_SYNC_TIME);
    //     console.log('lastSyncTime', lastSyncTime);
    //    const removed = removeLocalData(asyncStorageKeyName.LAST_SYNC_TIME)
    //     console.log('removed', removed);
    // return
    const getAllFolders = await FolderLocalService.getAllFolders();
    console.log('getAllFolders>>>', getAllFolders);
    getAllFolders.map((v) => console.log('name>>>', v))
    // return
    const gooleDrivefolderName = await GoogleDriveService.getOrCreateGDriveFolder(asyncStorageKeyName.DRIVE_FOLDER_NAME)
    console.log('gooleDrivefolderName', gooleDrivefolderName);
    let userId = await AuthService.getUserId()

    console.log('userId', userId);

    const firebaseFolders = await FirebaseService.getUpdatedFoldersByUserId()
    // console.log('firebaseFolders', firebaseFolders);

    const localFolders = await FolderLocalService.getAllFolders();
    // console.log('localFolders', localFolders);

    const localMap = new Map(
      localFolders.map(local => [local.firebaseId, local])
    );
    console.log('localMap :', [...localMap.keys()]);

    const firebaseIdSet = new Set(
      firebaseFolders.map(f => f.firebaseId)
    );
    console.log('firebaseIdSet:', [...firebaseIdSet]);
    // 🔄 Insert / Update
    await insertOrUpdateFolder(localMap, firebaseFolders, userId)
    // 🗑️ Delete
    await deleteSyncData(localFolders, firebaseFolders);
    //Push to firebase
    await pushFolders()

    // ✅ use max Firebase time
    const lastsyncTime = Number(
      (await getLocalData(asyncStorageKeyName.LAST_SYNC_TIME)) || 0
    );
    const maxUpdatedAt = Math.max(
      ...firebaseFolders.map((f: any) => f.updatedAt || 0),
      lastsyncTime || 0
    );
    console.log('maxUpdatedAt', maxUpdatedAt);


    setLocalData(asyncStorageKeyName.LAST_SYNC_TIME, maxUpdatedAt);
    const folders = await FolderLocalService.getActiveFolders();

    console.log('folders=====', folders);

    // setData(folders);
    return folders;

  }



  const insertOrUpdateFolder = async (localMap: Map<string, any>, firebaseFolders: any[], userId: any) => {
    for (const remote of firebaseFolders as any) { // loop through each folder from Firebase
      console.log('remote', remote);

      const local = localMap.get(remote.firebaseId); // find matching local folder using firebaseId
      console.log('local', local);
      console.log('local', local);
      console.log('remote.updatedAt:', remote.updatedAt, typeof remote.updatedAt);
      console.log('local.updatedAt:', local?.updatedAt, typeof local?.updatedAt);

      if (!local) { // if folder does NOT exist in local DB
        await FolderLocalService.createFolder(
          userId, // current user id
          remote.name, // folder name from Firebase
          remote.firebaseId, // Firebase id → stored as firebaseId locally
          remote.coverUri || '', // cover image (fallback to empty string)
          remote.driveFolderId || '', // Drive folder id (fallback if missing)
          1,// mark as synced (since coming from Firebase)
          remote.updatedAt
        );

      } else {

        // 🔥 first protect local data
        if (local.isSynced === 0) {
          continue;
        }

        // 🔥 then compare timestamps
        if (remote.updatedAt > local.updatedAt) {
          await FolderLocalService.updateFolderById({
            id: local.id,
            name: remote.name,
            isDeleted: remote.isDeleted
          });
        }
      }
    }
  }

  const deleteSyncData = async (localFolders: any, firebaseFolders: any) => {
    const deletedSet = new Set(
      firebaseFolders
        .filter((f: any) => f.isDeleted === 1) // only deleted items
        .map(f => f.firebaseId)
    );
    console.log('deletedSet:', [...deletedSet]);
    console.log('size:', deletedSet.size);
    console.log('firebaseFolders.length:', firebaseFolders.length);
    console.log('localFolders size:', localFolders.length);
    console.log('localFolders data:', localFolders);
    // 🔹 Apply delete to local
    for (const local of localFolders) {

      if (!local.firebaseId) continue;

      // 🔥 skip local changes (VERY IMPORTANT)
      if (local.isSynced === 0) {
        console.log('⛔ skip delete, local not synced:', local.firebaseId);
        continue;
      }

      if (deletedSet.has(local.firebaseId) && local.isDeleted === 0) {
        console.log('🗑️ deleting locally:', local.firebaseId);

        await FolderLocalService.deleteFolderById(local.id);
      }
    }
  }
  const pushFolders = async () => {
    console.log('pushFolders started');

    const userId = await AuthService.getUserId();
    const unSynced = await FolderLocalService.getUnsynced();

    console.log('unsyn', unSynced);

    for (const folder of unSynced as any) {

      try {
        folder.userId = userId;

        if (!folder.firebaseId) {
          // 🔹 CREATE (new folder)
          const doc = await FirebaseService.createFolderInFirebase(folder);

          await FolderLocalService.updateFirebaseId(
            folder.id,
            doc.firebaseId,
            userId
          );

        } else if (folder.isDeleted === 1) {
          // 🔹 DELETE (soft delete in Firebase)
          console.log('else DELETE here', folder);
          await FirebaseService.updateFolderInFirebase({
            firebaseId: folder.firebaseId,
            isDeleted: 1,
          });

          await FolderLocalService.markAsSynced(folder.id);

        } else {
          // 🔹 UPDATE (rename or changes)
          console.log('else update here', folder);

          await FirebaseService.updateFolderInFirebase(folder);

          await FolderLocalService.markAsSynced(folder.id);
        }

      } catch (e) {
        console.log('Push failed:', e);
      }
    }
  };