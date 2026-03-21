import { createBrowserRouter } from 'react-router-dom'
import { ProductPage } from '@/features/catalog/pages/ProductPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProductPage />,
  },
])
