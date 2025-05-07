import { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@vehicles/(.*)$': '<rootDir>/src/modules/vehicles/$1',
  },
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;
