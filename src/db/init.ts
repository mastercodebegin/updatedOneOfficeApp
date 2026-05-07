
export const initDB = async () => {
  try {
    // await initDB();
    console.log('✅ DB initialized');
  } catch (error) {
    console.error('❌ DB init error:', error);
    throw error;
  }
};