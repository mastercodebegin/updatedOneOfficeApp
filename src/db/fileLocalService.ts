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
        file.isSynced || 0,
        0,
        file.updatedAt || 0,
        file.folderFirebaseId || null,
      ]
    );

    return {
      ...file,

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
 async renameFile(id: number, updates: any) {
  const db = await getDB();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.displayName !== undefined) {
    fields.push("displayName = ?");
    values.push(updates.displayName);
  }



  if (updates.isDeleted !== undefined) {
    fields.push("isDeleted = ?");
    values.push(updates.isDeleted);
  }

  // always update sync flags
  fields.push("isSynced = 0");

  if (updates.updatedAt !== undefined) {
    fields.push("updatedAt = ?");
    values.push(updates.updatedAt);
  }

  // nothing to update → exit early
  if (fields.length === 1) return; // only isSynced added, no real change

  values.push(id);

  const query = `
    UPDATE files 
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  await db.executeSql(query, values);
},

async updateFile(id: number, updates: any) {

  console.log('updates', updates);
  
  const db = await getDB();

  const fields: string[] = [];
  const values: any[] = [];

  // only update what is passed

  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.displayName !== undefined) {
  fields.push("displayName = ?");
  values.push(updates.displayName);
}

  if (updates.isDeleted !== undefined) {
    fields.push("isDeleted = ?");
    values.push(updates.isDeleted);
  }

  if (updates.folderId !== undefined) {
    fields.push("folderId = ?");
    values.push(updates.folderId);
  }

  if (updates.updatedAt !== undefined) {
    fields.push("updatedAt = ?");
    values.push(updates.updatedAt);
  }

  if (updates.isSynced !== undefined) {
    fields.push("isSynced = ?");
    values.push(updates.isSynced);
  }

  // nothing to update
  if (fields.length === 0) return;

  values.push(id);

  const query = `
    UPDATE files
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  await db.executeSql(query, values);
},

    async updateFirebaseId(localId: number, firebaseId: string, userId: string,updatedAt: number,folderFirebaseId: string) {
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
   SET firebaseId = ?, 
       userId = ?, 
       folderFirebaseId = ?, 
       isSynced = 1, 
       updatedAt = ?
   WHERE id = ?`,
  [firebaseId, userId, folderFirebaseId, updatedAt, localId]
);
return {success: true};
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