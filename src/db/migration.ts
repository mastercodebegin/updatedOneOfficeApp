import { getDB } from './index';

export const initDB = async () => {
  const db = await getDB();

  try {
    console.log('🚀 Initializing DB (safe mode)');

    // 📂 FOLDERS TABLE
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        userId TEXT,

        name TEXT,
        coverUri TEXT,

        firebaseId TEXT UNIQUE,
        driveFolderId TEXT,

        isSynced INTEGER DEFAULT 0,
        isDeleted INTEGER DEFAULT 0,

        updatedAt INTEGER
        createdAt INTEGER
      )
    `);

    // 📄 FILES TABLE
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

    // ⚡ Indexes (safe to run multiple times)
    await db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_folders_firebaseFolderId 
      ON folders(firebaseId)
    `);

    await db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_files_firebaseFolderId 
      ON files(firebaseId)
    `);

    await db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_files_userId 
      ON files(userId)
    `);

    console.log('✅ DB ready (no data loss)');
  } catch (error) {
    console.log('❌ DB Init Error:', error);
  }
};