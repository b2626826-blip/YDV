import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './AppShell'
import { ProductionOrderDetailPage } from '../features/production/orders/pages/ProductionOrderDetailPage'
import { ProductionOrdersPage } from '../features/production/orders/pages/ProductionOrdersPage'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/production/orders" replace /> },
      { path: 'production/orders', element: <ProductionOrdersPage /> },
      { path: 'production/orders/:orderId', element: <ProductionOrderDetailPage /> },
    ],
  },
])
