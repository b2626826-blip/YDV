import { EU_SHOE_SIZES, type DeliveryBatch, type DeliveryBatchItem, type SizeQuantity } from '../types/production.ts';

export function getOrderSizeQuantities(batches: DeliveryBatch[], color: string): SizeQuantity[] {
  return EU_SHOE_SIZES.map((size) => ({
    size,
    quantity: batches.reduce((sum, batch) => sum + (batch.items.find((item) => item.color === color)?.sizeQuantities?.find((entry) => entry.size === size)?.quantity ?? 0), 0),
  }));
}

export function getBatchSizeLimit(item: DeliveryBatchItem, size: SizeQuantity['size']): number {
  const otherSizesQuantity = (item.sizeQuantities ?? []).filter((entry) => entry.size !== size).reduce((sum, entry) => sum + entry.quantity, 0);
  return Math.max(0, item.quantity - otherSizesQuantity);
}
