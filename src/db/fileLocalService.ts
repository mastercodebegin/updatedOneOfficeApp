import { getDB } from './index';

export interface CreateFileInput {
  id?:number,
  name: string;
  displayName?: string;

  size?: number;
  lastModified?: number;

  folderId: number;              // local folder id
  folderFirebaseId?: string;     // firebase folder id

  firebaseId?: string;           // for sync (optional during create)
  driveFileId?: string;

  userId?: string | null;

  isSynced?: number;             // 0 | 1
  isDeleted?: number;            // 0 | 1

  updatedAt?: number;
}

export const FileLocalService = {

  // ➕ CREATE
  async createFile(file: CreateFileInput) {
    const db = await getDB();

    await db.executeSql(
      `INSERT INTO files 
      (userId, name, displayName, size, lastModified, folderId, firebaseId, driveFileId, isSynced, isDeleted, updatedAt, folderFirebaseId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        file.userId,
        file.name,
        file.displayName,
        file.size,
        file.lastModified,
        file.folderId,               // local mapping
        file.firebaseId,       // 🔑 sync mapping
        file.driveFileId || '',    // 🔑 Drive ID
        0,
        0,
        file.updatedAt || 0,
        file.folderFirebaseId || null,
      ]
    );

    return {
      ...file,
      isSynced: 0,
      isDeleted: 0,
      updatedAt: 0,
    };
  },
    async getUnsynced() {
    try {
      const db = await getDB();

      const result = await db.executeSql(
        `SELECT * FROM files WHERE isSynced = 0`
      );

      const rows = result[0].rows;
      const data = [];

      for (let i = 0; i < rows.length; i++) {
        data.push(rows.item(i));
      }

      return data;

    } catch (error) {
      console.error('getUnsynced error:', error);
      throw error;
    }
  },

  async markAsSynced(localFileId: number, firebaseId?: string,updatedAt?: number) {
  const db = await getDB();

  // const timestamp = Date.now();

  await db.executeSql(
    `UPDATE files 
     SET isSynced = 1,
         updatedAt = ?,
         firebaseId = COALESCE(?, firebaseId)
     WHERE id = ?`,
    [updatedAt, firebaseId || null, localFileId]
  );
},

  // 📖 READ
  async getAllFiles() {
    const db = await getDB();

    const res = await db.executeSql(
      `SELECT * FROM files WHERE isDeleted = 0`
    );

    return res[0].rows.raw();
  },

  async getFileById(id: number) {
    const db = await getDB();

    const res = await db.executeSql(
      `SELECT * FROM files WHERE id = ?`,
      [id]
    );

    return res[0].rows.length > 0 ? res[0].rows.item(0) : null;
  },

  // 🔥 IMPORTANT (replaces remoteId)
  async getFileByDriveId(driveFileId: string) {
    const db = await getDB();

    const res = await db.executeSql(
      `SELECT * FROM files WHERE driveFileId = ? LIMIT 1`,
      [driveFileId]
    );

    return res[0].rows.length > 0 ? res[0].rows.item(0) : null;
  },

  async getUnsyncedFiles(userId: string) {
    const db = await getDB();

    const res = await db.executeSql(
      `SELECT * FROM files 
       WHERE isSynced = 0 AND isDeleted = 0 AND userId = ?`,
      [userId]
    );

    return res[0].rows.raw();
  },

  // 🔄 UPDATE
  async updateFile(id: number, updates: any) {
    const db = await getDB();

    await db.executeSql(
      `UPDATE files 
       SET name = ?, 
           displayName = ?, 
           size = ?, 
           lastModified = ?, 
           firebaseId = ?, 
           driveFileId = ?, 
           folderFirebaseId = ?,
           isSynced = 0, 
           updatedAt = ?
       WHERE id = ?`,
      [
        updates.name,
        updates.displayName,
        updates.size,
        updates.lastModified,
        updates.firebaseId,
        updates.driveFileId,
        updates.folderFirebaseId,
        updates.updatedAt,
        id,
      ]
    );
  },

    async updateFirebaseId(localId: number, firebaseId: string, userId: string,updatedAt: number) {
  const db = await getDB();
console.log('updatedAt updateFirebaseId:', updatedAt);
console.log({
  firebaseId,
  userId,
  updatedAt,
  localId
});
await db.executeSql(
  `UPDATE files 
   SET firebaseId = ?, userId = ?, isSynced = 1 , updatedAt = ?
   WHERE id = ?`,
  [firebaseId, userId, updatedAt, localId]   // ✅ correct order
);
},

  // ✅ MARK SYNCED
  async markSynced(id: number, driveFileId?: string) {
    const db = await getDB();

    if (driveFileId) {
      await db.executeSql(
        `UPDATE files 
         SET driveFileId = ?, isSynced = 1 
         WHERE id = ?`,
        [driveFileId, id]
      );
    } else {
      await db.executeSql(
        `UPDATE files SET isSynced = 1 WHERE id = ?`,
        [id]
      );
    }
  },

  // 🗑️ DELETE (soft)
  async deleteFile(id: number) {
    const db = await getDB();

    await db.executeSql(
      `UPDATE files 
       SET isDeleted = 1, isSynced = 0, updatedAt = ?
       WHERE id = ?`,
      [Date.now(), id]
    );
  },

  // 📂 FILES BY LOCAL FOLDER
  async getFilesByFolder(folderId: number) {
    const db = await getDB();

    const res = await db.executeSql(
      `SELECT * FROM files 
       WHERE folderId = ? AND isDeleted = 0`,
      [folderId]
    );

    return res[0].rows.raw();
  },

  // 📂 FILES BY FIREBASE FOLDER (SYNC USE)
  async getFilesByFirebaseFolderId(firebaseId: string) {
    const db = await getDB();

    const res = await db.executeSql(
      `SELECT * FROM files 
       WHERE firebaseId = ? AND isDeleted = 0`,
      [firebaseId]
    );

    return res[0].rows.raw();
  },

  async getFilesByIds(fileIds: number[]) {
    const db = await getDB();

    if (!fileIds || fileIds.length === 0) return [];

    const placeholders = fileIds.map(() => '?').join(',');

    const res = await db.executeSql(
      `SELECT * FROM files 
       WHERE id IN (${placeholders}) 
       AND isDeleted = 0`,
      fileIds
    );

    return res[0].rows.raw();
  },

  // 🔧 RESET (manual)
  async resetFilesTable() {
    const db = await getDB();

    await db.executeSql(`DROP TABLE IF EXISTS files`);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        userId TEXT,

        name TEXT,
        displayName TEXT,
        size INTEGER,
        lastModified INTEGER,

        folderId INTEGER,
        firebaseId TEXT,
        folderFirebaseId TEXT,

        driveFileId TEXT,

        isSynced INTEGER DEFAULT 0,
        isDeleted INTEGER DEFAULT 0,

        updatedAt INTEGER,

        FOREIGN KEY (folderId) REFERENCES folders(id)
      )
    `);

    await db.executeSql(`PRAGMA foreign_keys = ON`);

    console.log('🧹 files table reset');
  }
};