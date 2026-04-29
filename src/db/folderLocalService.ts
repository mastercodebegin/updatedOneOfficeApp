import { getDB } from ".";

export const FolderLocalService = {

  // ✅ CREATE
async createFolder(
  userId: string,
  name: string,
  firebaseId: string | null,
  coverUri: string,
  driveFolderId: string,
  isSynced: number,
  updatedAt?: number // 👈 optional

) {
  try {

    const db = await getDB();

    const timestamp = Date.now();
        const finalUpdatedAt = updatedAt ?? timestamp;

    console.log('📦 createFolder input:', {
      userId,
      name,
      firebaseId,
      coverUri,
      driveFolderId,
      isSynced,
      updatedAt
    });

    const res = await db.executeSql(
      `INSERT INTO folders 
      (userId, name, firebaseId, coverUri, driveFolderId, isSynced, updatedAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        firebaseId || null, // 🔥 important fix
        coverUri,
        driveFolderId,
        Number(isSynced),   // 🔥 ensure number
        updatedAt,
        timestamp
      ]
    );

    console.log('✅ Insert success:', res);

    return {
      id: res[0].insertId,
      userId,
      name,
      firebaseId,
      driveFolderId,
      isSynced,
      updatedAt: finalUpdatedAt,
      createdAt: timestamp
    };

  } catch (error: any) {
    console.log('❌ Insert error:', error?.message || error);
    console.log('❌ Full error object:', error);

    // 🔥 Extra debugging (very useful)
    if (error?.message?.includes('UNIQUE')) {
      console.log('⚠️ Likely firebaseId duplicate issue');
    }

    throw error;
  }
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
async updateFolderById({
  id,
  name,
  isDeleted,
}: {
  id: number;
  name?: string;
  isDeleted?: number;
}) {
  try {
    const db = await getDB();

    const updates: string[] = [];
    const values: any[] = [];

    // 🔹 update name
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }

    // 🔹 update delete flag
    if (isDeleted !== undefined) {
      updates.push('isDeleted = ?');
      values.push(isDeleted);
    }

    // 🔹 mark unsynced (local change)
    updates.push('isSynced = 0');

    values.push(id);

    // 🔥 debug logs
    console.log('🛠 updateFolderById:', {
      id,
      updates,
      values,
    });

    await db.executeSql(
      `UPDATE folders 
       SET ${updates.join(', ')} 
       WHERE id = ?`,
      values
    );

    console.log('✅ Folder updated locally');

  } catch (error: any) {
    console.log('❌ updateFolderById error:', error?.message || error);
    console.log('❌ Full error:', error);
    throw error;
  }
},

  // ✅ GET ALL
  async getAllFolders() {
    const db = await getDB();

    const res = await db.executeSql(`SELECT * FROM folders `);
    // const res = await db.executeSql(`SELECT * FROM folders where isDeleted = 0 ORDER BY updatedAt DESC`);
    return res[0].rows.raw();
  },
  async getActiveFolders() {
  try {
    const db = await getDB();

    const result = await db.executeSql(
      `SELECT * FROM folders WHERE isDeleted = 0`
    );

    const rows = result[0].rows;
    const data = [];

    for (let i = 0; i < rows.length; i++) {
      data.push(rows.item(i));
    }

    return data;

  } catch (error) {
    console.error('getActiveFolders error:', error);
    throw error;
  }
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
async deleteFolderById(id: number) {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {

        // 🔹 mark folder as deleted
        tx.executeSql(
          `UPDATE folders 
           SET isDeleted = 1, isSynced = 0 
           WHERE id = ?`,
          [id]
        );

        // 🔥 ALSO mark all files inside folder as deleted
        tx.executeSql(
          `UPDATE files 
           SET isDeleted = 1, isSynced = 0 
           WHERE folderId = ?`,
          [id]
        );
      },
      (error) => {
        console.log('❌ Delete error:', error);
        reject(error);
      },
      () => {
        console.log('✅ Folder & files marked deleted (local)');
        resolve(true);
      }
    );
  });
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
async markAsSynced(localFolderId: number, firebaseId?: string) {
  const db = await getDB();

  const timestamp = Date.now();

  await db.executeSql(
    `UPDATE folders 
     SET isSynced = 1,
         updatedAt = ?,
         firebaseId = COALESCE(?, firebaseId)
     WHERE id = ?`,
    [timestamp, firebaseId || null, localFolderId]
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
      updatedAt INTEGER,
      createdAt INTEGER
    )
  `);

  console.log('🧹 folders table reset');
};

