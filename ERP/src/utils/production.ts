import { DUE_SOON_DAYS } from '../config/constants';
import type { DeliveryBatch, ProductionOrder, ProductionStatus } from '../types/production';

export const getBatchQuantity = (batch: DeliveryBatch) => batch.items.reduce((sum, item) => sum + item.quantity, 0);
export const getBatchCompletedQuantity = (batch: DeliveryBatch) => batch.items.reduce((sum, item) => sum + item.completedQuantity, 0);
export const sumCompleted = (order: ProductionOrder) => order.deliveryBatches.reduce((sum, batch) => sum + getBatchCompletedQuantity(batch), 0);
export const getProgress = (completed: number, total: number) => total === 0 ? 0 : Math.round((completed / total) * 100);
export const getOrderProgress = (order: ProductionOrder) => getProgress(sumCompleted(order), order.totalQuantity);
export const formatQuantity = (quantity: number) => new Intl.NumberFormat('en-US').format(quantity);
export const formatDate = (date: string) => new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(`${date}T00:00:00`));

export const getNextOutstandingBatch = (order: ProductionOrder): DeliveryBatch | undefined => order.deliveryBatches
  .filter((batch) => getBatchCompletedQuantity(batch) < getBatchQuantity(batch))
  .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

export const isDueSoon = (batch: DeliveryBatch, now = new Date()) => {
  if (getBatchCompletedQuantity(batch) >= getBatchQuantity(batch)) return false;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(`${batch.dueDate}T00:00:00`);
  const remainingDays = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
  return remainingDays >= 0 && remainingDays <= DUE_SOON_DAYS;
};

export const deriveStatus = (order: ProductionOrder): ProductionStatus => {
  const completed = sumCompleted(order);
  if (order.status === 'completed') return 'completed';
  if (completed > 0) return 'production';
  return order.status;
};
