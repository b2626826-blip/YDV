import type { ProductionOrder } from '../types/production';

export function getProductColorOrders(orders: ProductionOrder[], productId: string, color: string): ProductionOrder[] {
  return orders.filter((order) => order.product.id === productId && order.items.some((item) => item.color === color && item.quantity > 0));
}
