import { getDB } from '.';

export interface ConvertedPdf {
  id?: number;
  name: string;
  path: string;
  size: number;
  createdAt: number;
}

const TABLE_NAME = 'converted_pdfs';

export const convertedPdfLocalService = {
  createTable: async () => {
    const db = await getDB();
    const query = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        size INTEGER,
        createdAt INTEGER NOT NULL
      );
    `;
    await db.executeSql(query);
  },

  createConvertedPdf: async (pdf: ConvertedPdf) => {
    const db = await getDB();
    const query = `
      INSERT INTO ${TABLE_NAME} (name, path, size, createdAt)
      VALUES (?, ?, ?, ?);
    `;
    const params = [pdf.name, pdf.path, pdf.size, pdf.createdAt];
    const [result] = await db.executeSql(query, params);
    return result.insertId;
  },

  getAllConvertedPdfs: async (): Promise<ConvertedPdf[]> => {
    const db = await getDB();
    const query = `SELECT * FROM ${TABLE_NAME} ORDER BY createdAt DESC;`;
    const [results] = await db.executeSql(query);
    const pdfs: ConvertedPdf[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      pdfs.push(results.rows.item(i));
    }
    return pdfs;
  },

  deleteConvertedPdf: async (id: number) => {
    const db = await getDB();
    const query = `DELETE FROM ${TABLE_NAME} WHERE id = ?;`;
    await db.executeSql(query, [id]);
  },
};