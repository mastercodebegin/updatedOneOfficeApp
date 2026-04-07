import { getDB } from './index';

export const FileLocalService = {

  // ➕ CREATE
  async createFile(file: any) {
    const db = await getDB();

    await db.executeSql(
  `INSERT INTO files 
   (name, size, lastModified, folderId, isSynced, isDeleted, updatedAt)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [
    file.name,
    file.size,
    file.lastModified,
    file.folderId,        // 🔥 relation value
    0,
    0,
    Date.now(),
  ]
);
return {
  name: file.name,
  size: file.size,
  lastModified: file.lastModified,
  folderId: file.folderId,
  isSynced: 0,
  isDeleted: 0,
  updatedAt: Date.now(),
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

    return res[0].rows.item(0);
  },

  async getUnsyncedFiles() {
    const db = await getDB();

    const res = await db.executeSql(
      `SELECT * FROM files WHERE isSynced = 0 AND isDeleted = 0`
    );

    return res[0].rows.raw();
  },

  // 🔄 UPDATE
  async updateFile(id: number, updates: any) {
    const db = await getDB();

    await db.executeSql(
      `UPDATE files 
       SET name = ?, size = ?, lastModified = ?, isSynced = 0, updatedAt = ?
       WHERE id = ?`,
      [
        updates.name,
        updates.size,
        updates.lastModified,
        Date.now(),
        id,
      ]
    );
  },

  async markSynced(id: number) {
    const db = await getDB();

    await db.executeSql(
      `UPDATE files SET isSynced = 1 WHERE id = ?`,
      [id]
    );
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

  // 📂 FILES BY FOLDER
  async getFilesByFolder(folderId: number) {
    const db = await getDB();

    const res = await db.executeSql(
      `SELECT * FROM files WHERE folderId = ? AND isDeleted = 0`,
      [folderId]
    );

    return res[0].rows.raw();
  },

async resetFilesTable() {
  const db = await getDB();

  await db.executeSql(`DROP TABLE IF EXISTS files`);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      size INTEGER,
      lastModified INTEGER,
      folderId INTEGER,
      remoteId TEXT,
      isSynced INTEGER DEFAULT 0,
      isDeleted INTEGER DEFAULT 0,
      updatedAt INTEGER,
      FOREIGN KEY (folderId) REFERENCES folders(id)
    )
  `);

  // 🔥 enable foreign keys (important)
  await db.executeSql(`PRAGMA foreign_keys = ON`);

  console.log('🧹 files table reset');
}
};