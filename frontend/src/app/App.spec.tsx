jest.mock('react-router-dom', () => ({
  RouterProvider: () => <div data-testid="router-provider" />,
}))

jest.mock('@/app/router', () => ({
  router: {},
}))

import { render, screen } from '@testing-library/react'
import App from '@/app/App'

describe('App', () => {
  it('renders the router provider', () => {
    render(<App />)

    expect(screen.getByTestId('router-provider')).toBeInTheDocument()
  })
})
