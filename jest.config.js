module.exports = {
    testEnvironment: "node",
    // testTimeout: 20000,
    roots: ['<rootDir>/tests'],  // Тесты только в tests/
    moduleFileExtensions: ['js'],
    verbose: false,  // Меньше логов (Sequelize не спамит в unit)
    testMatch: ['**/*.test.js'],
    moduleNameMapper: {
        '^app/models$': '<rootDir>/app/models',  // Alias для db = require('app/models')
        '^app/controllers/auth.controller$': '<rootDir>/app/controllers/auth.controller',
        '^app/config/auth.config$': '<rootDir>/app/config/auth.config',
    },
};