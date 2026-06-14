import { getDB } from ".";

export const FolderLocalService = {

  // ✅ CREATE
  async createFolder(
    userId: string,
    tagId: number,
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
        tagId,
        name,
        firebaseId,
        coverUri,
        driveFolderId,
        isSynced,
        updatedAt
      });

      const res = await db.executeSql(
        `INSERT INTO folders 
      (userId,tagId, name, firebaseId, coverUri, driveFolderId, isSynced, updatedAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`,
        [
          userId,
          tagId,
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
        tagId,
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

  // ✅ GET ALL
async getAllFolders() {
  const db = await getDB();

  const res = await db.executeSql(`
    SELECT
      folders.*,
      tags.id AS tag_db_id,
      tags.name AS tag_name,
      tags.color AS tag_color
    FROM folders
    LEFT JOIN tags
      ON folders.tagId = tags.id
    ORDER BY
      folders.isFavorite DESC,
      folders.createdAt DESC
  `);

  return res[0].rows.raw().map(item => ({
    ...item,
    tag: item.tag_db_id
      ? {
          id: item.tag_db_id,
          name: item.tag_name,
          color: item.tag_color,
        }
      : null,
  }));
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
    tagId,
    isDeleted,
    driveFolderId,
    coverUri,
    isFavorite,
  }: {
    id: number;
    name?: string;
    tagId?: number;
    isDeleted?: number;
    driveFolderId?: string;
    coverUri?: string;
    isFavorite?: number;
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

      if (coverUri !== undefined) {
        updates.push('coverUri = ?');
        values.push(coverUri);
      }
      if (driveFolderId !== undefined) {
        updates.push('driveFolderId = ?');
        values.push(driveFolderId);
      }

      // 🔹 update delete flag
      if (isDeleted !== undefined) {
        updates.push('isDeleted = ?');
        values.push(isDeleted);
      }
      if (tagId !== undefined) {
        updates.push('tagId = ?');
        values.push(tagId);
      }
      if (isFavorite !== undefined) {
        updates.push('isFavorite = ?');
        values.push(isFavorite);
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


async getActiveFolders() {
  try {
    const db = await getDB();

    const result = await db.executeSql(`
      SELECT
        folders.*,
        COUNT(files.id) AS filesCount
      FROM folders
      LEFT JOIN files
        ON files.folderId = folders.id
        AND files.isDeleted = 0
      WHERE folders.isDeleted = 0
      GROUP BY folders.id
      ORDER BY
        folders.isFavorite DESC,
        folders.createdAt DESC
    `);

    const rows = result[0].rows;
    const data = [];

    for (let i = 0; i < rows.length; i++) {
      data.push(rows.item(i));
    }

    return data;
  } catch (error) {
    console.log('getActiveFolders error:', error);
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

    tagId INTEGER,

    name TEXT,

    coverUri TEXT,

    firebaseId TEXT UNIQUE,

    driveFolderId TEXT,

    isSynced INTEGER DEFAULT 0,

    isDeleted INTEGER DEFAULT 0,
    isFavorite INTEGER DEFAULT 0,

    updatedAt INTEGER,

    createdAt INTEGER,

    FOREIGN KEY(tagId)
    REFERENCES tags(id)
)
`);

  console.log('🧹 folders table reset');
};

