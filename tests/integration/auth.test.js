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
  const app = require('../../server');  // Теперь мок применяется перед этим require
  const db = require('../../app/models'); 
  
  let server;
  
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    
    // Create roles (fix for setRoles([1]))
    const Role = db.role;
    await Role.create({ id: 1, name: 'user' });
    await Role.create({ id: 2, name: 'admin' });
    
    server = app.listen(0);
  }, 60000);
  
  afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
    await db.sequelize.close(); 
  }, 60000);
  
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