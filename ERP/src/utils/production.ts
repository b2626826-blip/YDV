import { DUE_SOON_DAYS } from '../config/constants.ts';
import type { DeliveryBatch, ProductionOrder, ProductionStatus } from '../types/production';

export const getBatchQuantity = (batch: DeliveryBatch) => batch.items.reduce((sum, item) => sum + item.quantity, 0);
export const getBatchCompletedQuantity = (batch: DeliveryBatch) => batch.items.reduce((sum, item) => sum + item.completedQuantity, 0);
export const getBatchDefectiveQuantity = (batch: DeliveryBatch) => batch.items.reduce((sum, item) => sum + (item.defectiveQuantity ?? 0), 0);
export const sumCompleted = (order: ProductionOrder) => order.deliveryBatches.reduce((sum, batch) => sum + getBatchCompletedQuantity(batch), 0);
export const sumDefective = (order: ProductionOrder) => order.deliveryBatches.reduce((sum, batch) => sum + getBatchDefectiveQuantity(batch), 0);
export const getDefectRate = (order: ProductionOrder) => {
  const defective = sumDefective(order);
  const inspected = sumCompleted(order) + defective;
  return inspected === 0 ? 0 : Math.round((defective / inspected) * 10000) / 100;
};
export const getProgress = (completed: number, total: number) => total === 0 ? 0 : Math.round((completed / total) * 100);
export const getOrderProgress = (order: ProductionOrder) => getProgress(sumCompleted(order), order.totalQuantity);
export const formatQuantity = (quantity: number) => new Intl.NumberFormat('en-US').format(quantity);
export const formatDate = (date: string) => new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(`${date}T00:00:00`));

export const getNextOutstandingBatch = (order: ProductionOrder): DeliveryBatch | undefined => order.deliveryBatches
  .filter((batch) => getBatchCompletedQuantity(batch) < getBatchQuantity(batch))
  .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
export const getDestinationBatch = (order: ProductionOrder): DeliveryBatch | undefined => getNextOutstandingBatch(order) ?? order.deliveryBatches.at(-1);

const CLOSED_STATUSES: ProductionStatus[] = ['completed', 'stopped', 'cancelled'];
export const isOpenStatus = (status: ProductionStatus) => !CLOSED_STATUSES.includes(status);

const getDaysUntilDue = (batch: DeliveryBatch, now: Date) => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(`${batch.dueDate}T00:00:00`);
  return Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
};
const isBatchOutstanding = (batch: DeliveryBatch) => getBatchCompletedQuantity(batch) < getBatchQuantity(batch);
export const isOverdue = (batch: DeliveryBatch, now = new Date()) => isBatchOutstanding(batch) && getDaysUntilDue(batch, now) < 0;
// Includes overdue batches: they need attention even more than upcoming ones.
export const isDueSoon = (batch: DeliveryBatch, now = new Date()) => isBatchOutstanding(batch) && getDaysUntilDue(batch, now) <= DUE_SOON_DAYS;
export const hasDueSoonBatch = (order: ProductionOrder, now = new Date()) => isOpenStatus(order.status) && order.deliveryBatches.some((batch) => isDueSoon(batch, now));

export const deriveStatus = (order: ProductionOrder): ProductionStatus => {
  const completed = sumCompleted(order);
  if (order.status === 'completed') return 'completed';
  if (order.status === 'paused' || order.status === 'stopped' || order.status === 'cancelled') return order.status;
  if (completed > 0) return 'production';
  return order.status;
};
