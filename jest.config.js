module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  roots: ['<rootDir>/src'],
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  testMatch: [
    `**/__tests__/*.test.ts`,
    `**/__tests__/*.propbased-test.ts`,
    `**/*.test.ts`,
    `**/*.propbased-test.ts`,
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  verbose: true,
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/lib',
    '<rootDir>/src/tests',
  ],
};
