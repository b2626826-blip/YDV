import assert from 'node:assert/strict';
import test from 'node:test';
import { getProductColorOrders } from './catalog.ts';
import type { ProductionOrder, ProductionStatus } from '../types/production';

const order = (id: string, productId: string, color: string, status: ProductionStatus = 'production', quantity = 10) => ({
  id, product: { id: productId }, items: [{ color, quantity }], status,
}) as ProductionOrder;

test('matches both shoe style and color across all order statuses', () => {
  const orders = [order('active', 'a', 'White'), order('completed', 'a', 'White', 'completed'), order('other-style', 'b', 'White'), order('other-color', 'a', 'Black'), order('cancelled', 'a', 'White', 'cancelled')];
  assert.deepEqual(getProductColorOrders(orders, 'a', 'White').map(({ id }) => id), ['active', 'completed', 'cancelled']);
});

test('returns no orders for an unused color or a zero-quantity item', () => {
  assert.deepEqual(getProductColorOrders([order('zero', 'a', 'Red', 'draft', 0)], 'a', 'Red'), []);
  assert.deepEqual(getProductColorOrders([order('white', 'a', 'White')], 'a', 'Red'), []);
});

test('includes a multi-color order once and reflects newly added orders', () => {
  const multi = { ...order('multi', 'a', 'Black'), items: [{ color: 'Black', quantity: 10 }, { color: 'White', quantity: 20 }] };
  const newer = order('new', 'a', 'White', 'draft');
  assert.deepEqual(getProductColorOrders([newer, multi], 'a', 'White').map(({ id }) => id), ['new', 'multi']);
});
