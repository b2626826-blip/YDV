import { useState } from 'react';
import { OrderForm } from './components/OrderForm';
import { productService } from './services/productService';
import { productionOrderService } from './services/productionOrderService';
import { DashboardPage } from './pages/DashboardPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { deriveStatus, sumCompleted } from './utils/production';
import type { ProductionOrder } from './types/production';

type Page = { kind: 'dashboard' } | { kind: 'create' } | { kind: 'detail'; orderId: string };

const products = productService.list();

export default function App() {
  const [orders, setOrders] = useState<ProductionOrder[]>(() => productionOrderService.list());
  const [page, setPage] = useState<Page>({ kind: 'dashboard' });
  const selectedOrder = page.kind === 'detail' ? orders.find((order) => order.id === page.orderId) : undefined;

  const handleCreate = (order: ProductionOrder) => {
    setOrders((current) => [order, ...current]);
    setPage({ kind: 'detail', orderId: order.id });
  };
  const handleCompletedChange = (batchId: string, color: string, quantity: number) => {
    if (!selectedOrder) return;
    setOrders((current) => current.map((order) => {
      if (order.id !== selectedOrder.id) return order;
      const updated = { ...order, deliveryBatches: order.deliveryBatches.map((batch) => batch.id === batchId ? { ...batch, items: batch.items.map((item) => item.color === color ? { ...item, completedQuantity: quantity } : item) } : batch) };
      return { ...updated, status: deriveStatus(updated) };
    }));
  };
  const handleCompleteOrder = () => {
    if (!selectedOrder || sumCompleted(selectedOrder) !== selectedOrder.totalQuantity) return;
    setOrders((current) => current.map((order) => order.id === selectedOrder.id ? { ...order, status: 'completed' } : order));
  };

  if (page.kind === 'create') return <OrderForm products={products} onCancel={() => setPage({ kind: 'dashboard' })} onCreate={handleCreate} />;
  if (selectedOrder) return <OrderDetailPage order={selectedOrder} onBack={() => setPage({ kind: 'dashboard' })} onCompletedChange={handleCompletedChange} onCompleteOrder={handleCompleteOrder} />;
  return <DashboardPage orders={orders} onOpenOrder={(orderId) => setPage({ kind: 'detail', orderId })} onCreateOrder={() => setPage({ kind: 'create' })} />;
}
