import '@testing-library/jest-dom'

jest.mock('@/shared/config/env', () => ({
  appEnv: {
    apiBaseUrl: 'http://localhost:3000/api',
    wompiBaseUrl: 'https://api-sandbox.co.uat.wompi.dev/v1',
    wompiPublicKey: 'pub_test_frontend',
  },
}))
