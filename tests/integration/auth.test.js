// const request = require('supertest');
// const app = require('../../server');  
// const db = require('../../app/models'); 

// let server;

// beforeAll(async () => {
//     await db.sequelize.sync({ force: true });
    
//     server = app.listen(0);
//   }, 50000);

//   afterAll(async () => {
//     await new Promise(resolve => server.close(resolve));
//     await db.sequelize.close(); 
//   }, 50000); 

// describe('Auth Controller Integration Tests', () => {
//   const testUser = {
//     username: 'testuser',
//     email: 'daria_butkevich4002@mail.ru',
//     password: '12345678'
//   };

//   // Регистрация пользователя
//   it('POST /api/auth/signup — should register a new user', async () => {
//     const res = await request(server)
//       .post('/api/auth/signup')
//       .send(testUser);

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('message', 'User registered successfully!');
//   }, 30000);

//   // Повторная регистрация с тем же email
//   it('POST /api/auth/signup — should return 500 on duplicate email', async () => {
//     const res = await request(server)
//       .post('/api/auth/signup')
//       .send(testUser);

//     expect(res.statusCode).toBe(500);
//     expect(res.body).toHaveProperty('message');
//   }, 30000);

//   // Успешный вход
//   it('POST /api/auth/signin — should login and return tokens', async () => {
//     const res = await request(server)
//       .post('/api/auth/signin')
//       .send({
//         username: testUser.username,
//         password: testUser.password
//       });

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('accessToken');
//     expect(res.body).toHaveProperty('refreshToken');
//   });

//   // Ошибка при входе с неверным паролем
//   it('POST /api/auth/signin — should return 401 with wrong password', async () => {
//     const res = await request(server)
//       .post('/api/auth/signin')
//       .send({
//         username: testUser.username,
//         password: 'wrongpassword'
//       });

//     expect(res.statusCode).toBe(401);
//     expect(res.body).toHaveProperty('message', 'Invalid Password!');
//   });

//   // Проверка обновления токена
//   it('POST /api/auth/refreshtoken — should issue new tokens', async () => {
//     // сначала войдём, чтобы получить refreshToken
//     const loginRes = await request(server)
//       .post('/api/auth/signin')
//       .send({
//         username: testUser.username,
//         password: testUser.password
//       });

//     const refreshToken = loginRes.body.refreshToken;

//     const refreshRes = await request(server)
//       .post('/api/auth/refreshtoken')
//       .send({ refreshToken });

//     expect(refreshRes.statusCode).toBe(200);
//     expect(refreshRes.body).toHaveProperty('accessToken');
//     expect(refreshRes.body).toHaveProperty('refreshToken');
//   });

//   // Ошибка при отсутствии refreshToken
//   it('POST /api/auth/refreshtoken — should return 403 if no token provided', async () => {
//     const res = await request(server)
//       .post('/api/auth/refreshtoken')
//       .send({});

//     expect(res.statusCode).toBe(403);
//     expect(res.body).toHaveProperty('message', 'Refresh Token is required!');
//   });
// });



// SAMOST' ПЕРВАЯ СТРОКА: Mock nodemailer (hoisted by Jest, applies before any require)
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-mock-id' })  // Fake success, no real email
    }))
  }));
  
  const request = require('supertest');
  const app = require('../../server');  
  const db = require('../../app/models'); 
  
  let server;
  describe('Auth Controller Integration Tests', () => {
    // beforeAll(async () => {
    //   // Disable Sequelize logs (убирает "Executing" spam)
    //   const originalLog = db.sequelize.options.logging;
    //   db.sequelize.options.logging = false;
  
    //   // Drop all tables + sync (чистая БД для тестов)
    //   await db.sequelize.drop();  // Дропает всё
    //   await db.sequelize.sync({ force: true });  // Пересоздаёт
    //   console.log('DB dropped and synced for tests');
  
    //   // Create roles
    //   const Role = db.role;
    //   await Role.create({ id: 1, name: "user" });
    //   await Role.create({ id: 2, name: "admin" });
  
    //   // Start server
    //   server = app.listen(0, 'localhost', () => {
    //     console.log('Test server started');
    //   });
  
    //   // Restore logging
    //   db.sequelize.options.logging = originalLog;
    // });

  beforeAll(async () => {
      // Disable ALL Sequelize logging (убирает "Executing" spam)
      db.sequelize.options.logging = false;  // Глобально для этого sequelize instance
    
      // Drop + sync (чистая БД)
      await db.sequelize.drop();
      await db.sequelize.sync({ force: true });
      console.log('DB dropped and synced for tests');
    
      await db.role.destroy({ where: {} });  // Truncate roles
      
      // Create roles
      const Role = db.role;
      await Role.create({ id: 1, name: "user" });
      await Role.create({ id: 2, name: "admin" });
    
      // Start server
      server = app.listen(0, 'localhost', () => {
        console.log('Test server started');
      });
  });

  // beforeAll(async () => {
  //   // Suppress Sequelize logs in tests (убирает "Executing" spam)
  //   const originalLog = db.sequelize.options.logging;
  //   db.sequelize.options.logging = false;  // Выключаем логи SQL
  
  //   // Sync с alter: true (обновляет схему, не стирает таблицы — решает "relation exists")
  //   await db.sequelize.sync({ alter: true });
  //   console.log('DB synced for tests');
  
  //   // Create roles
  //   const Role = db.role;
  //   await Role.create({ id: 1, name: "user" });
  //   await Role.create({ id: 2, name: "admin" });
  
  //   // Restore logs
  //   db.sequelize.options.logging = originalLog;
  // });
  
  // afterAll — увеличь timeout
  // afterAll(async () => {
  //   await new Promise(resolve => server.close(resolve));
  //   await db.sequelize.close();
  // }, 15000);  // 15s timeout
  afterAll(async () => {
      // Close server and DB (увеличь timeout)
      if (server) {
        await new Promise(resolve => server.close(resolve));
      }
      await db.sequelize.close();
  }, 20000);
  
  
  describe('Auth Controller Integration Tests', () => {
    const testUser = {
      username: 'testuser',
      email: 'daria_butkevich4002@mail.ru',
      password: '12345678'
    };
  
    // Опциональный дебаг-тест: Проверить, что мок работает
    it('should mock nodemailer correctly', () => {
      const nodemailer = require('nodemailer');  // Require здесь для теста
      expect(nodemailer.createTransport).toBeDefined();
      expect(typeof nodemailer.createTransport).toBe('function');
      expect(nodemailer.createTransport().sendMail).toBeDefined();
    });
  
    // Регистрация пользователя
    it('POST /api/auth/signup — should register a new user', async () => {
      const res = await request(server)
        .post('/api/auth/signup')
        .send(testUser);
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'User registered successfully!');
    }, 60000);
  
    // Повторная регистрация с тем же email
    it('POST /api/auth/signup — should return 400 on duplicate email', async () => {
      const res = await request(server)
        .post('/api/auth/signup')
        .send(testUser);
  
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    }, 30000);
  
    // Успешный вход
    it('POST /api/auth/signin — should login and return tokens', async () => {
      const res = await request(server)
        .post('/api/auth/signin')
        .send({
          username: testUser.username,
          password: testUser.password
        });
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(Array.isArray(res.body.roles)).toBe(true);
    }, 30000);
  
    // Ошибка при входе с неверным паролем
    it('POST /api/auth/signin — should return 401 with wrong password', async () => {
      const res = await request(server)
        .post('/api/auth/signin')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        });
  
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid Password!');
    }, 30000);
  
    // Проверка обновления токена
    it('POST /api/auth/refreshtoken — should issue new tokens', async () => {
      const loginRes = await request(server)
        .post('/api/auth/signin')
        .send({
          username: testUser.username,
          password: testUser.password
        });
  
      const refreshToken = loginRes.body.refreshToken;
  
      const refreshRes = await request(server)
        .post('/api/auth/refreshtoken')
        .send({ refreshToken });
  
      expect(refreshRes.statusCode).toBe(200);
      expect(refreshRes.body).toHaveProperty('accessToken');
      expect(refreshRes.body).toHaveProperty('refreshToken');
    }, 30000);
  
    // Ошибка при отсутствии refreshToken
    it('POST /api/auth/refreshtoken — should return 403 if no token provided', async () => {
      const res = await request(server)
        .post('/api/auth/refreshtoken')
        .send({});
  
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Refresh Token is required!');
    }, 30000);
  });
});