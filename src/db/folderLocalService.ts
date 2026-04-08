import { getDB } from ".";

export const FolderLocalService = {
  // CREATE
async createFolder(name: string,coverUri:string) {
  const db = await getDB();
console.log('coverUri===',coverUri);

  const timestamp = Date.now();

  const res = await db.executeSql(
    `INSERT INTO folders (name, remoteId, updatedAt, coverUri)
     VALUES (?, ?, ?, ?)`,
    [name, null, timestamp, coverUri]
  );

  return {
    id: res[0].insertId,
    name,
    // coverUri,
    updatedAt: timestamp,
    remoteId: null,
  };
},

async isFolderExists(name: string) {
  const db = await getDB();

  const res = await db.executeSql(
    `SELECT id FROM folders WHERE name = ? LIMIT 1`,
    [name]
  );

  return res[0].rows.length > 0;
},
async updateFolder(
  id: number,
  name: string,
  coverUri: string | null = null
) {
  const db = await getDB();
  const timestamp = Date.now();

  await db.executeSql(
    `UPDATE folders
     SET name = ?, coverUri = ?, updatedAt = ?
     WHERE id = ?`,
    [name, coverUri, timestamp, id]
  );

  return {
    id,
    name,
    coverUri,
    updatedAt: timestamp,
  };
},

  // READ (THIS ONE 👇)
  async getAllFolders() {
    const db = await getDB();

    const res = await db.executeSql(`SELECT * FROM folders`);
    return res[0].rows.raw();
  },
async getFolderById(id: number) {
  const db = await getDB();

  const res = await db.executeSql(
    `SELECT * FROM folders WHERE id = ?`,
    [id]
  );

  return res[0].rows.length > 0 ? res[0].rows.item(0) : null;
},
async deleteFoldersWithFiles(folderIds: number[]) {
  const db = await getDB();

  console.log('folders ids =====', folderIds);

  if (!folderIds || folderIds.length === 0) return;

  const placeholders = folderIds.map(() => '?').join(',');

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // 1. Delete files
        tx.executeSql(
          `DELETE FROM files WHERE folderId IN (${placeholders})`,
          folderIds
        );

        // 2. Delete folders
        tx.executeSql(
          `DELETE FROM folders WHERE id IN (${placeholders})`,
          folderIds
        );
      },
      (error) => {
        console.log('❌ Transaction error:', error);
        reject(error);
      },
      () => {
        console.log('✅ Transaction success');
        resolve(true);
      }
    );
  })}}
export const testFolders = async () => {
  try {
    console.log('🚀 Testing folders...');

    // ➕ Insert dummy data
    await FolderLocalService.createFolder('Travel','');
    await FolderLocalService.createFolder('Work','');
    await FolderLocalService.createFolder('Personal','');

    console.log('✅ Inserted folders');

    // 📖 Fetch all
    const folders = await FolderLocalService.getAllFolders();

    console.log('📁 All Folders:', folders);

  } catch (error) {
    console.error('❌ Folder test failed:', error);
  }
};

export const resetFoldersTable = async () => {
  const db = await getDB();

  await db.executeSql(`DROP TABLE IF EXISTS folders`);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT ,
      remoteId TEXT,
      coverUri,
      updatedAt INTEGER
    )
  `);

  console.log('🧹 folders table reset');
};