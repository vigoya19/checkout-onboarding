/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup-tests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/shared/config/env$': '<rootDir>/src/test/mocks/env.ts',
  },
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/test/**',
    '!src/app/router.tsx',
    '!src/app/hooks.ts',
    '!src/app/providers/store.ts',
    '!src/shared/config/env.ts',
    '!src/shared/types/**',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
}
