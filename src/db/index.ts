import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDB = async () => {
  try {
    if (dbInstance) return dbInstance;

    dbInstance = await SQLite.openDatabase({
      name: 'app.db',
      location: 'default',
    });

    console.log('✅ DB connected');

    return dbInstance;
  } catch (error) {
    console.error('❌ DB connection error:', error);
    throw error;
  }
};