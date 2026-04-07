import { runMigrations } from './migration';

export const initDB = async () => {
  try {
    await runMigrations();
    console.log('✅ DB initialized');
  } catch (error) {
    console.error('❌ DB init error:', error);
    throw error;
  }
};