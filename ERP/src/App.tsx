import { useState } from 'react';
import { OrderForm } from './components/OrderForm';
import { productService } from './services/productService';
import { productionOrderService } from './services/productionOrderService';
import { DashboardPage } from './pages/DashboardPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { deriveStatus, sumCompleted } from './utils/production';
import { assignOrderGroup, formatOrderNumber, getNextOrderSequence } from './utils/orderNumbers';
import type { ProductionOrder, ProductionStatus } from './types/production';

type Page = { kind: 'dashboard' } | { kind: 'create' } | { kind: 'edit'; orderId: string } | { kind: 'detail'; orderId: string };

const products = productService.list();

export default function App() {
  const [orders, setOrders] = useState<ProductionOrder[]>(() => productionOrderService.list());
  const [page, setPage] = useState<Page>({ kind: 'dashboard' });
  const selectedOrder = page.kind === 'detail' || page.kind === 'edit' ? orders.find((order) => order.id === page.orderId) : undefined;

  const handleCreate = (createdOrders: ProductionOrder[]) => {
    const year = new Date().getFullYear();
    const nextSequence = getNextOrderSequence(orders.map((order) => order.orderNumber), year);
    const orderNumber = formatOrderNumber(year, nextSequence);
    const numberedOrders = assignOrderGroup(createdOrders, orderNumber);
    setOrders((current) => [...numberedOrders, ...current]);
    setPage({ kind: 'detail', orderId: numberedOrders[0]!.id });
  };

  const handleUpdate = (updatedOrder: ProductionOrder) => {
    setOrders((current) => current.map((order) => order.id === updatedOrder.id ? updatedOrder : order));
    setPage({ kind: 'detail', orderId: updatedOrder.id });
  };

  const handleCompletedChange = (batchId: string, color: string, quantity: number) => {
    if (!selectedOrder || selectedOrder.status !== 'production') return;
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
    if (!selectedOrder || selectedOrder.status !== 'production') return;
    setOrders((current) => current.map((order) => order.id === selectedOrder.id ? {
      ...order,
      deliveryBatches: order.deliveryBatches.map((batch) => batch.id === batchId
        ? { ...batch, items: batch.items.map((item) => item.color === color ? { ...item, defectiveQuantity: quantity } : item) }
        : batch),
    } : order));
  };

  const handleCompleteOrder = () => {
    if (!selectedOrder || selectedOrder.status !== 'production' || sumCompleted(selectedOrder) !== selectedOrder.totalQuantity) return;
    setOrders((current) => current.map((order) => order.id === selectedOrder.id ? { ...order, status: 'completed' } : order));
  };

  const updateStatus = (status: ProductionStatus, statusReason?: string) => {
    if (!selectedOrder) return;
    setOrders((current) => current.map((order) => order.id === selectedOrder.id ? { ...order, status, statusReason } : order));
  };

  const handleSubmitToPurchasing = () => {
    if (selectedOrder?.status === 'draft') updateStatus('purchasing');
  };

  const handleHandoffToProduction = () => {
    if (selectedOrder?.status === 'purchasing') updateStatus('pending');
  };

  const handleScheduleOrder = (lines: Record<string, string>) => {
    if (selectedOrder?.status !== 'pending') return;
    setOrders((current) => current.map((order) => order.id === selectedOrder.id ? {
      ...order,
      status: 'production',
      deliveryBatches: order.deliveryBatches.map((batch) => ({ ...batch, productionLine: lines[batch.id] ?? batch.productionLine })),
    } : order));
  };

  const handlePauseOrder = () => {
    if (selectedOrder?.status === 'production') updateStatus('paused');
  };

  const handleResumeOrder = () => {
    if (selectedOrder?.status === 'paused') updateStatus('production');
  };

  const handleStopOrder = (reason: string) => {
    if (selectedOrder?.status === 'production' || selectedOrder?.status === 'paused') updateStatus('stopped', reason);
  };

  const handleCancelOrder = (reason: string) => {
    if (selectedOrder && ['purchasing', 'pending'].includes(selectedOrder.status)) updateStatus('cancelled', reason);
  };

  const handleDeleteDraft = () => {
    if (selectedOrder?.status !== 'draft') return;
    setOrders((current) => current.filter((order) => order.id !== selectedOrder.id));
    setPage({ kind: 'dashboard' });
  };

  if (page.kind === 'create') return <OrderForm products={products} onCancel={() => setPage({ kind: 'dashboard' })} onCreate={handleCreate} />;
  if (page.kind === 'edit' && selectedOrder) return <OrderForm products={products} initialOrder={selectedOrder} onCancel={() => setPage({ kind: 'detail', orderId: selectedOrder.id })} onUpdate={handleUpdate} />;
  if (selectedOrder) return <OrderDetailPage order={selectedOrder} onBack={() => setPage({ kind: 'dashboard' })} onEdit={() => setPage({ kind: 'edit', orderId: selectedOrder.id })} onCompletedChange={handleCompletedChange} onDefectiveChange={handleDefectiveChange} onCompleteOrder={handleCompleteOrder} onSubmitToPurchasing={handleSubmitToPurchasing} onHandoffToProduction={handleHandoffToProduction} onScheduleOrder={handleScheduleOrder} onPauseOrder={handlePauseOrder} onResumeOrder={handleResumeOrder} onStopOrder={handleStopOrder} onCancelOrder={handleCancelOrder} onDeleteDraft={handleDeleteDraft} />;
  return <DashboardPage orders={orders} onOpenOrder={(orderId) => setPage({ kind: 'detail', orderId })} onCreateOrder={() => setPage({ kind: 'create' })} />;
}
