// ADD TAG
import { getDB } from './index';


// GET TAGS

 const getTags = async () => {
  try {
    const db = await getDB();

    const results = await db.executeSql(
      `
      SELECT * FROM tags
      WHERE  isDeleted = 0
      ORDER BY createdAt DESC
      `
    );

    return results[0].rows.raw();
  } catch (error) {
    console.log('getTags error', error);

    return [];
  }
};

 const addTag = async ({
  userId,
  name,
  color,
}: any) => {
  try {
    const db = await getDB();

    const now = Date.now();

    await db.executeSql(
      `
      INSERT INTO tags (
        userId,
        name,
        color,
        createdAt,
        updatedAt,
        isSynced,
        isDeleted
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        name,
        color,
        now,
        now,
        0,
        0,
      ],
    );
return{
    userId,
    name,
    color,
    createdAt: now,
    updatedAt: now,
    isSynced: 0,
    isDeleted: 0,
}
    console.log('Tag added');
  } catch (error) {
    console.log('addTag error', error);
  }
};

export const tagLocalService = {
  getTags,
  addTag,
}