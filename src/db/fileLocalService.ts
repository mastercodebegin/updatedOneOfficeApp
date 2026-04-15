import { getDB } from './index';

export const FileLocalService = {

  // ➕ CREATE
  async createFile(file: any) {
    const db = await getDB();
    const timestamp = Date.now();

    await db.executeSql(
      `INSERT INTO files 
      (userId, name, displayName, size, lastModified, folderId, firebaseId, driveFileId, isSynced, isDeleted, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        file.userId,
        file.name,
        file.displayName,
        file.size,
        file.lastModified,
        file.folderId,               // local mapping
        file.firebaseId,       // 🔑 sync mapping
        file.driveFileId || null,    // 🔑 Drive ID
        0,
        0,
        timestamp,
      ]
    );

    return {
      ...file,
      isSynced: 0,
      isDeleted: 0,
      updatedAt: timestamp,
    };
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
    const timestamp = Date.now();

    await db.executeSql(
      `UPDATE files 
       SET name = ?, 
           displayName = ?, 
           size = ?, 
           lastModified = ?, 
           firebaseId = ?, 
           driveFileId = ?, 
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
        timestamp,
        id,
      ]
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