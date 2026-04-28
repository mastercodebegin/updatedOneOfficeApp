
import { getLocalData, removeLocalData, setLocalData } from '../../utilies/storageService';
import { FolderLocalService, resetFoldersTable } from '../../db/folderLocalService';
import { DateHelper } from '../../utilies/DateHelper';
import { CreateFileInput, FileLocalService } from '../../db/fileLocalService';
import { FirebaseService } from '../../service/FirebaseService';
import { GoogleDriveService } from '../../db/googleDriveService';
import { AuthService } from '../../service/AuthService';
import { useGoogleAuth } from '../../customhooks/useGoogleAuth';
import { asyncStorageKeyName, CONSTANT, DateFormat } from '../../utilies/Constants';
import { folder } from 'jszip';


export const syncAll = async () => {
  //  const dummyFile = {
  //   userId: "user_123",
  //   name: "photo.jpg",
  //   displayName: "photo",          // without extension
  //   size: 204800,                 // in bytes (200 KB)
  //   lastModified: Date.now(),
  //   folderId: 1,                 // local folder id
  //   firebaseId: "file_abc123",    // firebase file id
  //   driveFileId: "drive_xyz789",  // optional
  //   folderFirebaseId: "folder_abc123" // firebase folder id
  // };
  // await resetFoldersTable ()
    // await FileLocalService.resetFilesTable ()
  // return[]
  const folders = await syncFoldersFromFirebaseToLocal()
  const files = await syncFilesFromFirebaseToLocal()
  // console.log('Synced folders:', folders);
  // console.log('Synced files:', files);
  // await FileLocalService.createFile(dummyFile)
  // const allFiles = await FileLocalService.getAllFiles()
  // console.log('allFiles', allFiles);


  return folders;

}
const syncFilesFromFirebaseToLocal = async () => {
  // await pushFilesToFirebase()
  // await FileLocalService.resetFilesTable ()

  // return[]
  //     const lastSyncTime =  getLocalData(asyncStorageKeyName.LAST_SYNC_TIME);
  //     console.log('lastSyncTime', lastSyncTime);
  //    const removed = removeLocalData(asyncStorageKeyName.LAST_SYNC_TIME)
  // console.log('removed', removed);

  const firebaseFiles = await FirebaseService.getUpdatedFilesByUserId()
  console.log('firebaseFiles*******************', firebaseFiles);
  // return []
  // console.log('localFolders', localFolders);
  const localFiles = await FileLocalService.getAllFiles();
  const localFolders = await FolderLocalService.getActiveFolders();
  console.log('localFiles>>>', localFiles)
  const gooleDrivefolderName = await GoogleDriveService.getOrCreateGDriveFolderName(asyncStorageKeyName.DRIVE_FOLDER_NAME)
  let userId = await AuthService.getUserId()

  const folderMap = new Map(
    localFolders.map(f => [f.firebaseId, f.id])
  );

  const localFilesMap = new Map(
    localFiles.map(local => [local.firebaseId, local])
  );
  console.log('localFilesMap keys :', [...localFilesMap.keys()]);
  console.log('localFilesMap values :', [...localFilesMap.values()]);

  //  await deleteSyncFiles(localFiles, firebaseFiles);
  // return
  // 🔄 Insert / Update
  await insertOrUpdateFiles(localFilesMap, firebaseFiles, userId, folderMap)
  // 🗑️ Delete
  await deleteSyncFiles(localFiles, firebaseFiles);
  //Push to firebase
  const data: any = await pushFilesToFirebase()
  // return []



  console.log('Sync completed', data);
  console.log('Sync completed updatedAt', data.updatedAt);

  // setLocalData(asyncStorageKeyName.LAST_SYNC_TIME, data.updatedAt);
  const folders = await FileLocalService.getAllFiles();

  console.log('folders=====', folders);

  return folders;

}

const insertOrUpdateFiles = async (
  localFilesMap: any,
  firebaseFiles: any,
  userId: any,
  folderMap: any   // 🔥 required
) => {
  console.log('******************* INSERT OR UPDATE FILE STARTED ********************');
  console.log('localFilesMap', [...localFilesMap.keys()]);
  console.log('firebaseFiles', firebaseFiles);
  console.log('userId', userId);
  console.log('folderMap', folderMap);

  let data = null

  for (const remote of firebaseFiles) {

    console.log('remote', remote);
    const local = localFilesMap.get(remote.firebaseId);
    console.log('remote.firebaseId', local);

    // 🔥 map firebase → local
    const folderLocalId = folderMap.get(remote.folderFirebaseId);


    if (!folderLocalId) {
      console.log('⛔ Folder not found, skip:', remote.firebaseId);
      continue;
    }

    // ✅ CREATE
    if (!local) {
      data = await FileLocalService.createFile({
        userId,
        name: remote.name,
        displayName: remote.displayName,
        size: remote.size,
        lastModified: remote.lastModified,
        firebaseId: remote.firebaseId,
        folderId: folderLocalId,   // ✅ correct
        coverUri: remote.coverUri || '',
        driveFolderId: remote.driveFolderId || '',
        isSynced: 1,
        updatedAt: remote.updatedAt,
        folderFirebaseId: remote.folderFirebaseId || ''
      });
      console.log('created file', data);

      continue;
    }

    // 🔥 protect local changes

    if (local.isSynced === 0) continue;

    // ✅ UPDATE only if newer
    if (Number(remote.updatedAt) > Number(local.updatedAt)) {
      console.log('upda file-----');

      data = await FileLocalService.updateFile(local.id, {
        name: remote.name,
        isDeleted: remote.isDeleted,
        updatedAt: remote.updatedAt,
        folderId: folderLocalId, // handles move
        isSynced: 1
      });
      console.log('updated file', data);

    }
  }
  return data
};

const deleteSyncFiles = async (localFiles: any, firebaseFiles: any) => {
  console.log('localFiles:', localFiles);
  console.log('firebaseFiles:', firebaseFiles);
  const deletedSet = new Set(
    firebaseFiles
      .filter((f: any) => f.isDeleted === 1) // only deleted items
      .map(f => f.firebaseId)
  );
  console.log('deletedSet:', [...deletedSet]);
  console.log('size:', deletedSet.size);
  console.log('firebaseFiles.length:', firebaseFiles.length);
  console.log('localFiles size:', localFiles.length);
  console.log('localFiles data:', localFiles);
  // 🔹 Apply delete to local
  for (const local of localFiles) {

    if (!local.firebaseId) continue;

    // 🔥 skip local changes (VERY IMPORTANT)
    if (local.isSynced === 0) {
      console.log('⛔ skip delete, local not synced:', local.firebaseId);
      continue;
    }

    if (deletedSet.has(local.firebaseId) && local.isDeleted === 0) {
      console.log('🗑️ deleting locally:', local.firebaseId);

      await FileLocalService.deleteFile(local.id);
    }
  }
}

const pushFilesToFirebase = async () => {
  console.log('pushFiles started');

  const userId = await AuthService.getUserId();
  const unSynced: CreateFileInput[] = await FileLocalService.getUnsynced();

  console.log('unsyn', unSynced);
  let data = null
  for (const file of unSynced) {
    file.userId = userId;

    try {
      file.userId = userId;

      if (!file.firebaseId) {
        // 🔹 CREATE (new file)
        const folder = await FolderLocalService.getFolderById(file.folderId);
        console.log('folder in file', folder);

        file.folderFirebaseId = folder?.firebaseId || '';
        console.log('sstarted creating------', file);
        // return
        data = await FirebaseService.createFile(file);

        console.log('file pushing>>>>>>>>>>', data);

       const localFile =  await FileLocalService.updateFirebaseId(
          file.id,
          data.firebaseId,
          userId,
          data.updatedAt

        );
        console.log('update file in local after push to firebase',localFile);
        

      } else if (file.isDeleted === 1) {
        // 🔹 DELETE (soft delete in Firebase)
        console.log('else DELETE here', file);
        data = await FirebaseService.updateFileInFirebase(file);

        await FileLocalService.markAsSynced(file.id);

      } else {
        // 🔹 UPDATE (rename or changes)
        console.log('else update here', file);

        data = await FirebaseService.updateFileInFirebase(file);

        console.log('updated. else update here', data);

        await FileLocalService.markAsSynced(file.id, data.firebaseId, data.updatedAt);
      }
      
    } 
    catch (e) {
      console.log('Push failed:', e);
    }
  }
  return data

};



























const syncFoldersFromFirebaseToLocal = async () => {
  // resetFoldersTable()
  //     const lastSyncTime =  getLocalData(asyncStorageKeyName.LAST_SYNC_TIME);
  //     console.log('lastSyncTime', lastSyncTime);
  //    const removed = removeLocalData(asyncStorageKeyName.LAST_SYNC_TIME)
  // console.log('removed', removed);

 
  // return []
  const localFolders = await FolderLocalService.getAllFolders();
  // console.log('localFolders', localFolders);
  const localFiles = await FileLocalService.getAllFiles();
  console.log('getAllFiles>>>', localFiles)
  const gooleDrivefolderName = await GoogleDriveService.getOrCreateGDriveFolderName(asyncStorageKeyName.DRIVE_FOLDER_NAME)
  let userId = await AuthService.getUserId()

  console.log('userId', userId);

  const firebaseFolders = await FirebaseService.getUpdatedFoldersByUserId()
  console.log('firebaseFolders', firebaseFolders);


  const localMap = new Map(
    localFolders.map(local => [local.firebaseId, local])
  );
  console.log('folder localMap keys :', [...localMap.keys()]);
  console.log(' folder localMap values :', [...localMap.values()]);

  const firebaseIdSet = new Set(
    firebaseFolders.map(f => f.firebaseId)
  );
  console.log('folder firebaseIdSet:', [...firebaseIdSet]);
  // 🔄 Insert / Update
  await insertOrUpdateFolder(localMap, firebaseFolders, userId)
  // 🗑️ Delete
  await deleteSyncFolders(localFolders, firebaseFolders);
  //Push to firebase
  await pushFoldersToFirebase()

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

  return folders;

}

const insertOrUpdateFolder = async (localFoldersMap: Map<string, any>, firebaseFolders: any[], userId: any) => {
  for (const remote of firebaseFolders as any) { // loop through each folder from Firebase
    console.log('remote', remote);

    const local = localFoldersMap.get(remote.firebaseId); // find matching local folder using firebaseId
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


const deleteSyncFolders = async (localFolders: any, firebaseFolders: any) => {
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


const pushFoldersToFirebase = async () => {
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