import { getDB } from './index';

export const runMigrations = async () => {
  const db = await getDB();

  const res = await db.executeSql(`PRAGMA user_version;`);
  const currentVersion = res[0].rows.item(0).user_version;

  console.log('DB Version:', currentVersion);

  // Version 1 → Initial setup
  if (currentVersion < 1) {
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS files (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
size INTEGER,
lastModified INTEGER,
folderId INTEGER,           -- 🔥 relation to folders
remoteId TEXT,              -- 🔥 for sync
isSynced INTEGER DEFAULT 0,
isDeleted INTEGER DEFAULT 0,
updatedAt INTEGER,
FOREIGN KEY (folderId) REFERENCES folders(id)
);
    `);

    await db.executeSql(`PRAGMA user_version = 1;`);
  }

  // Version 2 → Future example
  if (currentVersion < 2) {
    await db.executeSql(`
      ALTER TABLE files ADD COLUMN isFavorite INTEGER DEFAULT 0;
    `);

    await db.executeSql(`PRAGMA user_version = 2;`);
  }

  if (currentVersion < 3) {
    console.log('🚀 Running migration v3 (folders)');

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remoteId TEXT,
        name TEXT,
        coverUri TEXT,
        updatedAt INTEGER
        );
        `);

    await db.executeSql(`PRAGMA user_version = 3;`);

    console.log('✅ Migration v3 done');
  }
};