module.exports = {
  HOST: process.env.DB_HOST || 'localhost',
  USER: process.env.DB_USER || 'postgres',
  PASSWORD: process.env.DB_PASSWORD || '12465067',
  DB: process.env.NODE_ENV === "test" ? "test_lab5db_test" : "test_lab5db",
  // DB: process.env.DB_NAME || 'test_lab5db',
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
