import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveStatus, getDefectRate, getDestinationBatch } from './production.ts';
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
