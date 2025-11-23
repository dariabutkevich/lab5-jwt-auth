// module.exports = {
//   HOST: process.env.DB_HOST || 'localhost',
//   USER: process.env.DB_USER || 'postgres',
//   PASSWORD: process.env.DB_PASSWORD || '12465067',
//   DB: process.env.NODE_ENV === "test" ? "test_lab5db_test" : "test_lab5db",
//   // DB: process.env.DB_NAME || 'test_lab5db',
//   dialect: "postgres",
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }
// };


module.exports = {
    HOST: process.env.DB_HOST || 'localhost',
    USER: process.env.DB_USER || 'postgres',
    PASSWORD: process.env.DB_PASSWORD || '12465067',
    
    // Используем DB_NAME из переменных окружения (более гибко для Production)
    DB: process.env.DB_NAME || (process.env.NODE_ENV === "test" ? "test_lab5db_test" : "test_lab5db"), 
  
    dialect: "postgres",
    
    // *** ИСПРАВЛЕНИЕ ДЛЯ RENDER: ДОБАВЛЕНИЕ SSL ***
    dialectOptions: {
      // Этот блок необходим для подключения к базам данных Render/Heroku
      ssl: {
        require: true,             // Требовать SSL
        rejectUnauthorized: false // Часто нужно, чтобы избежать проблем с самоподписанными сертификатами
      }
    },
    // ***********************************************
  
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };