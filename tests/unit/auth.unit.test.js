const path = require('path');

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-mock-id' })
  }))
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

jest.mock(jest.requireActual('path').resolve(__dirname, '../../app/models'), () => ({
  user: { create: jest.fn(), findOne: jest.fn() },
  role: { findAll: jest.fn() },
  refreshToken: { findOne: jest.fn(), createToken: jest.fn(), verifyExpiration: jest.fn() },
  Sequelize: { Op: { or: Symbol('or') } } 
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require(path.resolve(__dirname, '../../app/config/auth.config'));  // Absolute path
const authController = require(path.resolve(__dirname, '../../app/controllers/auth.controller'));  // Absolute path

describe('Auth Controller Unit Tests', () => {
  let mockReq, mockRes, mockUser, mockRoles;

  beforeEach(() => {
    mockReq = { body: { username: 'test1', email: 'daria_butkevich4002@mail.ru', password: 'pass' } };
    mockRes = { 
      send: jest.fn(), 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    mockUser = { 
      setRoles: jest.fn(() => Promise.resolve()), 
      getRoles: jest.fn(() => Promise.resolve(mockRoles || [])),
      id: 1,
      username: 'test1',
      email: 'daria_butkevich4002@mail.ru',
      password: 'hashed'
    };
    mockRoles = [{ name: 'user' }];

    const db = require(path.resolve(__dirname, '../../app/models'));
    db.user.create.mockReset();
    db.user.findOne.mockReset();
    db.role.findAll.mockReset();
    db.refreshToken.findOne.mockReset();
    db.refreshToken.createToken.mockReset();
    db.refreshToken.verifyExpiration.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    beforeEach(() => {
      const db = require(path.resolve(__dirname, '../../app/models'));
      db.user.create.mockResolvedValue(mockUser);
      db.role.findAll.mockResolvedValue([]);
    });

    it('should hash password and set default role on success', () => {
      const hashSync = require('bcryptjs').hashSync;
      hashSync.mockReturnValue('hashedPass');

      return authController.signup(mockReq, mockRes).then(() => {
        expect(hashSync).toHaveBeenCalledWith('pass', 8);
        expect(mockUser.setRoles).toHaveBeenCalledWith([1]);
        expect(mockRes.send).toHaveBeenCalledWith({ message: 'User registered successfully!' });
      });
    }, 10000);

    it('should catch errors', () => {
      const db = require(path.resolve(__dirname, '../../app/models'));
      db.user.create.mockRejectedValue(new Error('DB Error'));

      return authController.signup(mockReq, mockRes).catch(() => {
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({ message: 'DB Error' });
      });
    }, 10000);
  });

  describe('signin', () => {
    beforeEach(() => {
      const db = require(path.resolve(__dirname, '../../app/models'));
      db.user.findOne.mockResolvedValue(mockUser);
      db.refreshToken.createToken.mockResolvedValue('refreshToken');
    });

    it('should validate password and generate tokens', () => {
      const compareSync = require('bcryptjs').compareSync;
      compareSync.mockReturnValue(true);
      const sign = require('jsonwebtoken').sign;
      sign.mockReturnValue('accessToken');

      mockReq.body.username = 'test';
      mockReq.body.password = 'pass';

      return authController.signin(mockReq, mockRes).then(() => {
        expect(compareSync).toHaveBeenCalledWith('pass', 'hashed');
        expect(sign).toHaveBeenCalledWith({ id: 1 }, config.secret, expect.any(Object));
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
          roles: ['ROLE_USER']
        }));
      });
    }, 10000);

    it('should return 404 if user not found', () => {
      const db = require(path.resolve(__dirname, '../../app/models'));
      db.user.findOne.mockResolvedValue(null);

      return authController.signin(mockReq, mockRes).then(() => {
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.send).toHaveBeenCalledWith({ message: 'User Not found.' });
      });
    }, 10000);
  });

  describe('refreshToken', () => {
    beforeEach(() => {
      const db = require(path.resolve(__dirname, '../../app/models'));
      db.refreshToken.createToken.mockResolvedValue('newRefreshToken');
      db.refreshToken.verifyExpiration.mockReturnValue(false);
    });

    it('should return 403 if no token provided', () => {
      mockReq.body = {};

      return authController.refreshToken(mockReq, mockRes).then(() => {
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Refresh Token is required!' });
      });
    }, 10000);

    it('should return 403 if token not in DB', () => {
      const db = require(path.resolve(__dirname, '../../app/models'));
      db.refreshToken.findOne.mockResolvedValue(null);

      mockReq.body.refreshToken = 'invalidToken';

      return authController.refreshToken(mockReq, mockRes).then(() => {
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Refresh token is not in database!' });
      });
    }, 10000);
  });
});