/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setupEnv.ts'],
  globalSetup: '<rootDir>/tests/globalSetup.ts',
  clearMocks: true,
  collectCoverageFrom: [
    'src/modules/**/*.service.ts',
    'src/modules/**/*.utils.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  testTimeout: 30000,
};
