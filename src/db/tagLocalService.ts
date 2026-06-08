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

type UpdateTagPayload = {
  name?: string;

  color?: string;

  isDeleted?: number;

  isSynced?: number;
};

const updateTag = async (
  id: number,
  updates: UpdateTagPayload,
) => {
  try {
    const db = await getDB();

    const fields: string[] = [];

    const values: any[] = [];

    // only update passed keys
    if (updates.name !== undefined) {
      fields.push('name = ?');

      values.push(updates.name);
    }

    if (
      updates.isDeleted !== undefined
    ) {
      fields.push('isDeleted = ?');

      values.push(updates.isDeleted);
    }

    if (
      updates.color !== undefined
    ) {
      fields.push('color = ?');

      values.push(updates.color);
    }

    if (
      updates.isSynced !== undefined
    ) {
      fields.push('isSynced = ?');

      values.push(updates.isSynced);
    }

    // always update updatedAt
    fields.push('updatedAt = ?');

    values.push(Date.now());

    values.push(id);

    await db.executeSql(
      `
      UPDATE tags
      SET ${fields.join(', ')}
      WHERE id = ?
      `,
      values,
    );

    console.log('Tag updated');
  } catch (error) {
    console.log(
      'updateTag error',
      error,
    );
  }
};

const getTagById = async (id: number) => {
  try {
    const db = await getDB();

    const results = await db.executeSql(
      `
      SELECT * FROM tags
      WHERE id = ?
      `,
      [id]
    );

    return results[0].rows.raw()[0];
  } catch (error) {
    console.log('getTagById error', error);

    return null;
  }
}

const getTagByName = async (name: string) => {
  try {
    const db = await getDB();

    const results = await db.executeSql(
      `
      SELECT * FROM tags
      WHERE name = ?
      `,
      [name]
    );

    return results[0].rows.raw()[0];
  } catch (error) {
    console.log('getTagById error', error);

    return null;
  }
}
export const tagLocalService = {
  getTags,
  addTag,
  updateTag,
    getTagById,
    getTagByName
}