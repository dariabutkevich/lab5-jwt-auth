module.exports = {
  secret: process.env.JWT_SECRET || "test-lab4-secret-key",
  jwtExpiration: 20,
  jwtRefreshExpiration: 86400,
};
