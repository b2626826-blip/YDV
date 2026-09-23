import assert from 'node:assert/strict';
import test from 'node:test';
import { getDefectRate } from './production.ts';
import type { ProductionOrder } from '../types/production';

const order = (completedQuantity: number, defectiveQuantity: number) => ({
  deliveryBatches: [{ items: [{ completedQuantity, defectiveQuantity }] }],
}) as ProductionOrder;

test('calculates defect rate from completed and defective quantities', () => {
  assert.equal(getDefectRate(order(1500, 12)), 0.79);
});

test('returns zero defect rate when nothing has been inspected', () => {
  assert.equal(getDefectRate(order(0, 0)), 0);
});
