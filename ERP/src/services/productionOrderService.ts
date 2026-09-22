import { productionOrders } from '../mock/orders';
import type { ProductionOrder } from '../types/production';

const cloneOrder = (order: ProductionOrder): ProductionOrder => ({
  ...order,
  product: { ...order.product, availableColors: [...order.product.availableColors] },
  items: order.items.map((item) => ({ ...item })),
  deliveryBatches: order.deliveryBatches.map((batch) => ({ ...batch, items: batch.items.map((item) => ({ ...item })) })),
});

export const productionOrderService = {
  list: (): ProductionOrder[] => productionOrders.map(cloneOrder),
};
