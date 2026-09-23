import { useState } from 'react';
import { OrderForm } from './components/OrderForm';
import { productService } from './services/productService';
import { productionOrderService } from './services/productionOrderService';
import { DashboardPage } from './pages/DashboardPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { deriveStatus, sumCompleted } from './utils/production';
import { assignOrderGroup, formatOrderNumber, getNextOrderSequence } from './utils/orderNumbers';
import type { ProductionOrder } from './types/production';

type Page = { kind: 'dashboard' } | { kind: 'create' } | { kind: 'detail'; orderId: string };

const products = productService.list();

export default function App() {
  const [orders, setOrders] = useState<ProductionOrder[]>(() => productionOrderService.list());
  const [page, setPage] = useState<Page>({ kind: 'dashboard' });
  const selectedOrder = page.kind === 'detail' ? orders.find((order) => order.id === page.orderId) : undefined;

  const handleCreate = (createdOrders: ProductionOrder[]) => {
    const year = new Date().getFullYear();
    const nextSequence = getNextOrderSequence(orders.map((order) => order.orderNumber), year);
    const orderNumber = formatOrderNumber(year, nextSequence);
    const numberedOrders = assignOrderGroup(createdOrders, orderNumber);
    setOrders((current) => [...numberedOrders, ...current]);
    setPage({ kind: 'detail', orderId: numberedOrders[0]!.id });
  };

  const handleCompletedChange = (batchId: string, color: string, quantity: number) => {
    if (!selectedOrder) return;
    setOrders((current) => current.map((order) => {
      if (order.id !== selectedOrder.id) return order;
      const updated = {
        ...order,
        deliveryBatches: order.deliveryBatches.map((batch) => batch.id === batchId
          ? { ...batch, items: batch.items.map((item) => item.color === color ? { ...item, completedQuantity: quantity } : item) }
          : batch),
      };
      return { ...updated, status: deriveStatus(updated) };
    }));
  };

  const handleDefectiveChange = (batchId: string, color: string, quantity: number) => {
    if (!selectedOrder) return;
    setOrders((current) => current.map((order) => order.id === selectedOrder.id ? {
      ...order,
      deliveryBatches: order.deliveryBatches.map((batch) => batch.id === batchId
        ? { ...batch, items: batch.items.map((item) => item.color === color ? { ...item, defectiveQuantity: quantity } : item) }
        : batch),
    } : order));
  };

  const handleCompleteOrder = () => {
    if (!selectedOrder || sumCompleted(selectedOrder) !== selectedOrder.totalQuantity) return;
    setOrders((current) => current.map((order) => order.id === selectedOrder.id ? { ...order, status: 'completed' } : order));
  };

  const handleScheduleOrder = () => {
    if (!selectedOrder || (selectedOrder.status !== 'purchasing' && selectedOrder.status !== 'pending')) return;
    setOrders((current) => current.map((order) => order.id === selectedOrder.id ? { ...order, status: 'production' } : order));
  };

  if (page.kind === 'create') return <OrderForm products={products} onCancel={() => setPage({ kind: 'dashboard' })} onCreate={handleCreate} />;
  if (selectedOrder) return <OrderDetailPage order={selectedOrder} onBack={() => setPage({ kind: 'dashboard' })} onCompletedChange={handleCompletedChange} onDefectiveChange={handleDefectiveChange} onCompleteOrder={handleCompleteOrder} onScheduleOrder={handleScheduleOrder} />;
  return <DashboardPage orders={orders} onOpenOrder={(orderId) => setPage({ kind: 'detail', orderId })} onCreateOrder={() => setPage({ kind: 'create' })} />;
}
