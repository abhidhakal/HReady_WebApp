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
    '\\.(webp|png|jpg|jpeg|svg|gif|ico|mp4|mp3|woff|woff2|ttf|eot|json)$': '<rootDir>/src/__tests__/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@babel|@mui|react-router-dom|react-router|@testing-library|ci-info|expect)/)'
  ],
  testMatch: ['**/__tests__/**/*.test.{js,jsx}'],
}; 