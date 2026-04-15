import { getDB } from ".";

export const FolderLocalService = {

  // ✅ CREATE
  async createFolder(
    userId: string,
    name: string,
    firebaseId: string,
    coverUri: string,
    driveFolderId: string,
    isSynced: number
  ) {
    const db = await getDB();
    const timestamp = Date.now();

    const res = await db.executeSql(
      `INSERT INTO folders 
      (userId, name, firebaseId, coverUri, driveFolderId, isSynced, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, firebaseId, coverUri, driveFolderId, isSynced, timestamp]
    );

    return {
      id: res[0].insertId,
      userId,
      name,
      firebaseId,
      driveFolderId,
      isSynced,
      updatedAt: timestamp
    };
  },

  // ✅ CHECK EXISTS (by firebaseId)
  async isFolderExists(firebaseId: string) {
    const db = await getDB();

    const res = await db.executeSql(
      `SELECT id FROM folders WHERE firebaseId = ? LIMIT 1`,
      [firebaseId]
    );

    return res[0].rows.length > 0;
  },
  async getUnsynced() {
    try {
      const db = await getDB();

      const result = await db.executeSql(
        `SELECT * FROM folders WHERE isSynced = 0`
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

  // ✅ GET BY FIREBASE ID (MAIN METHOD)
  async getFolderByFirebaseId(firebaseId: string) {
    const db = await getDB();

    const result = await db.executeSql(
      `SELECT * FROM folders WHERE firebaseId = ? LIMIT 1`,
      [firebaseId]
    );

    return result[0].rows.length > 0 ? result[0].rows.item(0) : null;
  },

  // ✅ GET BY DRIVE ID (for upload mapping)
  async getFolderByDriveId(driveFolderId: string) {
    const db = await getDB();

    const result = await db.executeSql(
      `SELECT * FROM folders WHERE driveFolderId = ? LIMIT 1`,
      [driveFolderId]
    );

    return result[0].rows.length > 0 ? result[0].rows.item(0) : null;
  },

  // ✅ UPDATE (FIXED)
  async updateFolder({
    name,
    firebaseId,
    coverUri,
    driveFolderId,
    updatedAt,
  }: {
    name: string;
    firebaseId: string;
    coverUri: string;
    driveFolderId: string;
    updatedAt: number;
  }) {
    try {
      const db = await getDB();

      await db.executeSql(
        `UPDATE folders 
       SET name = ?, 
           coverUri = ?, 
           driveFolderId = ?, 
           updatedAt = ?, 
           isSynced = 1
       WHERE firebaseId = ?`,
        [
          name,
          coverUri,
          driveFolderId,
          updatedAt,
          firebaseId,
        ]
      );

    } catch (error) {
      console.error('updateFolder error:', error);
      throw error;
    }
  },

  // ✅ GET ALL
  async getAllFolders() {
    const db = await getDB();

    const res = await db.executeSql(`SELECT * FROM folders`);
    return res[0].rows.raw();
  },

  async updateFirebaseId(localId: number, firebaseId: string, userId: string) {
  const db = await getDB();

  await db.executeSql(
    `UPDATE folders 
     SET firebaseId = ?, userId = ?, isSynced = 1 
     WHERE id = ?`,
    [firebaseId, userId, localId]
  );
},
  // ✅ GET BY LOCAL ID
  async getFolderById(id: number) {
    const db = await getDB();

    const res = await db.executeSql(
      `SELECT * FROM folders WHERE id = ?`,
      [id]
    );

    return res[0].rows.length > 0 ? res[0].rows.item(0) : null;
  },

  // ✅ DELETE USING FIREBASE ID (SYNC SAFE)
  async deleteFolderByFirebaseId(firebaseId: string) {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {

          // 🔹 mark folder as deleted instead of removing
          tx.executeSql(
            `UPDATE folders 
         SET isDeleted = 1, updatedAt = ? 
         WHERE firebaseId = ?`,
            [Date.now(), firebaseId]
          );
        },
        (error) => {
          console.log('❌ Delete error:', error);
          reject(error);
        },
        () => {
          console.log('✅ Folder marked as deleted');
          resolve(true);
        }
      );
    })
  },

  // ✅ GET UNSYNCED
  // async getUnsynced(userId: string) {
  //   const db = await getDB();

  //   const [result] = await db.executeSql(
  //     `SELECT * FROM folders 
  //      WHERE isSynced = 0 AND userId = ?
  //      ORDER BY updatedAt DESC`,
  //     [userId]
  //   );

  //   return result.rows.raw();
  // },

  // ✅ MARK AS SYNCED
  async markAsSynced(localFolderId: number, firebaseId: string) {
    const db = await getDB();

    await db.executeSql(
      `UPDATE folders
       SET firebaseId = ?, isSynced = 1
       WHERE id = ?`,
      [firebaseId, localFolderId]
    );
  },

  async getGoogleDriveFolderFromDB() {
    const db = await getDB();

    try {
      const result = await db.executeSql(
        `SELECT driveFolderId 
       FROM folders 
       WHERE driveFolderId IS NOT NULL 
       LIMIT 1`
      );

      const rows = result[0].rows;

      if (rows.length > 0) {
        return rows.item(0).driveFolderId;
      }

      return null;
    } catch (error) {
      console.log('❌ DB Error:', error);
      return null;
    }
  }
};


// ✅ RESET TABLE (UPDATED)
export const resetFoldersTable = async () => {
  const db = await getDB();

  await db.executeSql(`DROP TABLE IF EXISTS folders`);

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
    )
  `);

  console.log('🧹 folders table reset');
};

