module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
  roots: ["<rootDir>/src"],
  transform: { "^.+\\.tsx?$": "ts-jest" },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  verbose: true,

  testEnvironment: "node",
  coveragePathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/src/lib",
    "<rootDir>/src/tests",
  ],
};
