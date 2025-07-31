module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '^/src/(.*)\\.css$': 'identity-obj-proxy',
    '^/src/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^src/(.*)$': '<rootDir>/src/$1',
    '\\.(webp|png|jpg|jpeg|svg|gif|ico|mp4|mp3|woff|woff2|ttf|eot|json)$': '<rootDir>/src/tests/mocks/fileMock.js',
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@babel|@mui|react-router-dom|react-router|@testing-library|ci-info|expect)/)'
  ],
  testMatch: ['**/tests/**/*.test.{js,jsx}'],
  // Add timeout configuration for API tests
  testTimeout: 30000, // 30 seconds timeout for tests
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  // Add verbose output for better debugging
  verbose: true,
  // Add coverage configuration
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
}; 