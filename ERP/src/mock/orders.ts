import { products } from './products';
import type { DeliveryBatch, ProductionOrder } from '../types/production';

const product = (code: string) => products.find((item) => item.productCode === code)!;
const singleColorBatch = (id: string, batchNumber: number, color: string, quantity: number, completedQuantity: number, dueDate: string, destinationCountry: string, note?: string): DeliveryBatch => ({ id, batchNumber, items: [{ color, quantity, completedQuantity }], dueDate, destinationCountry, note });

export const productionOrders: ProductionOrder[] = [
  {
    id: 'order-2026-001', orderNumber: 'PO-2026-001', product: product('A2387'), items: [{ color: 'Black', quantity: 5000 }], totalQuantity: 5000,
    deliveryBatches: [
      singleColorBatch('batch-001-1', 1, 'Black', 2000, 1500, '2026-10-10', 'Vietnam'),
      singleColorBatch('batch-001-2', 2, 'Black', 2000, 800, '2026-10-20', 'Japan'),
      singleColorBatch('batch-001-3', 3, 'Black', 1000, 0, '2026-10-30', 'United States'),
    ], status: 'production', createdAt: '2026-09-16',
  },
  {
    id: 'order-2026-002', orderNumber: 'PO-2026-002', product: product('B1042'), items: [{ color: 'Olive', quantity: 1800 }], totalQuantity: 1800,
    deliveryBatches: [singleColorBatch('batch-002-1', 1, 'Olive', 1800, 0, '2026-09-25', 'Vietnam', '優先出貨')], status: 'purchasing', createdAt: '2026-09-17',
  },
  {
    id: 'order-2026-003', orderNumber: 'PO-2026-003', product: product('C5510'), items: [{ color: 'White', quantity: 2400 }, { color: 'Sky Blue', quantity: 1600 }], totalQuantity: 4000,
    deliveryBatches: [
      { id: 'batch-003-1', batchNumber: 1, items: [{ color: 'White', quantity: 2200, completedQuantity: 1200 }], dueDate: '2026-10-04', destinationCountry: 'Japan' },
      { id: 'batch-003-2', batchNumber: 2, items: [{ color: 'White', quantity: 200, completedQuantity: 0 }, { color: 'Sky Blue', quantity: 1600, completedQuantity: 0 }], dueDate: '2026-10-18', destinationCountry: 'Taiwan' },
    ], status: 'production', createdAt: '2026-09-10',
  },
  {
    id: 'order-2026-004', orderNumber: 'PO-2026-004', product: product('D8831'), items: [{ color: 'Gum', quantity: 1200 }], totalQuantity: 1200,
    deliveryBatches: [singleColorBatch('batch-004-1', 1, 'Gum', 1200, 0, '2026-10-12', 'Korea')], status: 'pending', createdAt: '2026-09-20',
  },
  {
    id: 'order-2026-005', orderNumber: 'PO-2026-005', product: product('E7712'), items: [{ color: 'Red', quantity: 3000 }], totalQuantity: 3000,
    deliveryBatches: [singleColorBatch('batch-005-1', 1, 'Red', 1500, 1450, '2026-09-28', 'United States'), singleColorBatch('batch-005-2', 2, 'Red', 1500, 1250, '2026-10-08', 'Canada')], status: 'production', createdAt: '2026-09-11',
  },
  {
    id: 'order-2026-006', orderNumber: 'PO-2026-006', product: product('F3208'), items: [{ color: 'Beige', quantity: 900 }], totalQuantity: 900,
    deliveryBatches: [singleColorBatch('batch-006-1', 1, 'Beige', 900, 900, '2026-09-18', 'Australia')], status: 'completed', createdAt: '2026-08-28',
  },
  {
    id: 'order-2026-007', orderNumber: 'PO-2026-007', product: product('A2387'), items: [{ color: 'White', quantity: 2600 }], totalQuantity: 2600,
    deliveryBatches: [singleColorBatch('batch-007-1', 1, 'White', 1300, 400, '2026-10-06', 'Indonesia'), singleColorBatch('batch-007-2', 2, 'White', 1300, 0, '2026-10-22', 'Thailand')], status: 'production', createdAt: '2026-09-14',
  },
  {
    id: 'order-2026-008', orderNumber: 'PO-2026-008', product: product('B1042'), items: [{ color: 'Black', quantity: 2200 }], totalQuantity: 2200,
    deliveryBatches: [singleColorBatch('batch-008-1', 1, 'Black', 2200, 0, '2026-10-28', 'Vietnam')], status: 'pending', createdAt: '2026-09-21',
  },
  {
    id: 'order-2026-009', orderNumber: 'PO-2026-009', product: product('D8831'), items: [{ color: 'White', quantity: 3500 }], totalQuantity: 3500,
    deliveryBatches: [singleColorBatch('batch-009-1', 1, 'White', 2000, 2000, '2026-09-15', 'Europe'), singleColorBatch('batch-009-2', 2, 'White', 1500, 600, '2026-10-09', 'Germany')], status: 'production', createdAt: '2026-09-01',
  },
  {
    id: 'order-2026-010', orderNumber: 'PO-2026-010', product: product('C5510'), items: [{ color: 'Navy', quantity: 1600 }], totalQuantity: 1600,
    deliveryBatches: [singleColorBatch('batch-010-1', 1, 'Navy', 1600, 1600, '2026-09-14', 'Japan')], status: 'completed', createdAt: '2026-08-25',
  },
];
