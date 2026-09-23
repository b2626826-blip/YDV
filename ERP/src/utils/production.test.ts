import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveStatus, getDefectRate, getDestinationBatch, hasDueSoonBatch, isDueSoon, isOverdue } from './production.ts';
import type { ProductionOrder } from '../types/production';

const order = (completedQuantity: number, defectiveQuantity: number) => ({
  deliveryBatches: [{ items: [{ completedQuantity, defectiveQuantity }] }],
}) as ProductionOrder;

const statusOrder = (status: ProductionOrder['status']) => ({ ...order(10, 0), status }) as ProductionOrder;

test('calculates defect rate from completed and defective quantities', () => {
  assert.equal(getDefectRate(order(1500, 12)), 0.79);
});

test('returns zero defect rate when nothing has been inspected', () => {
  assert.equal(getDefectRate(order(0, 0)), 0);
});

test('uses the last delivered batch as the destination when an order is complete', () => {
  const completedOrder = {
    deliveryBatches: [
      { dueDate: '2026-09-18', destinationCountry: 'Australia', items: [{ quantity: 900, completedQuantity: 900 }] },
    ],
  } as ProductionOrder;

  assert.equal(getDestinationBatch(completedOrder)?.destinationCountry, 'Australia');
});

test('preserves paused, stopped, and cancelled states when progress changes', () => {
  assert.equal(deriveStatus(statusOrder('paused')), 'paused');
  assert.equal(deriveStatus(statusOrder('stopped')), 'stopped');
  assert.equal(deriveStatus(statusOrder('cancelled')), 'cancelled');
});

test('flags overdue and upcoming outstanding batches but skips closed orders', () => {
  const now = new Date('2026-09-23T12:00:00');
  const batch = (dueDate: string, completedQuantity = 0) => ({ dueDate, items: [{ quantity: 100, completedQuantity }] }) as ProductionOrder['deliveryBatches'][number];

  assert.equal(isDueSoon(batch('2026-09-30'), now), true);
  assert.equal(isDueSoon(batch('2026-10-01'), now), false);
  assert.equal(isDueSoon(batch('2020-01-01'), now), true);
  assert.equal(isOverdue(batch('2020-01-01'), now), true);
  assert.equal(isOverdue(batch('2026-09-23'), now), false);
  assert.equal(isDueSoon(batch('2026-09-25', 100), now), false);

  const dueOrder = (status: ProductionOrder['status']) => ({ status, deliveryBatches: [batch('2026-09-25')] }) as ProductionOrder;
  assert.equal(hasDueSoonBatch(dueOrder('production'), now), true);
  assert.equal(hasDueSoonBatch(dueOrder('paused'), now), true);
  assert.equal(hasDueSoonBatch(dueOrder('cancelled'), now), false);
  assert.equal(hasDueSoonBatch(dueOrder('stopped'), now), false);
});
