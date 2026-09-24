import assert from 'node:assert/strict';
import test from 'node:test';
import { getBatchSizeLimit, getOrderSizeQuantities } from './batchSizes.ts';
import type { DeliveryBatch, DeliveryBatchItem } from '../types/production';

const item = (sizes: [number, number][], color = 'White'): DeliveryBatchItem => ({
  color, quantity: 50, completedQuantity: 0, defectiveQuantity: 0,
  sizeQuantities: sizes.map(([size, quantity]) => ({ size, quantity })) as DeliveryBatchItem['sizeQuantities'],
});
const batch = (items: DeliveryBatchItem[]): DeliveryBatch => ({
  id: 'batch', batchNumber: 1, productionLine: '', dueDate: '2026-10-02', destinationCountry: 'TW', items,
});

test('allows the remaining 20 pairs in any size when a batch has allocated 30 of 50', () => {
  const second = item([[41, 10], [42, 10], [43, 10]]);
  assert.equal(getBatchSizeLimit(second, 38), 20);
  assert.equal(getBatchSizeLimit(second, 41), 30);
});

test('aggregates the same size across batches without requiring an upfront size quota', () => {
  const batches = [batch([item([[38, 10]])]), batch([item([[38, 20], [41, 10], [42, 10], [43, 10]])])];
  const summary = getOrderSizeQuantities(batches, 'White');
  assert.equal(summary.find((entry) => entry.size === 38)?.quantity, 30);
  assert.equal(summary.reduce((sum, entry) => sum + entry.quantity, 0), 60);
  assert.equal(summary.find((entry) => entry.size === 45)?.quantity, 0);
});

test('keeps colors separate and recalculates after batch removal', () => {
  const first = batch([item([[38, 10]]), item([[38, 7]], 'Black')]);
  const second = batch([item([[38, 20]])]);
  assert.equal(getOrderSizeQuantities([first, second], 'Black').find((entry) => entry.size === 38)?.quantity, 7);
  assert.equal(getOrderSizeQuantities([first], 'White').find((entry) => entry.size === 38)?.quantity, 10);
  assert.ok(getOrderSizeQuantities([], 'White').every((entry) => entry.quantity === 0));
});

test('does not double count the edited size when enforcing the batch total', () => {
  const full = item([[38, 20], [41, 10], [42, 10], [43, 10]]);
  assert.equal(getBatchSizeLimit(full, 38), 20);
  assert.equal(getBatchSizeLimit(full, 44), 0);
  full.quantity = 20;
  assert.equal(getBatchSizeLimit(full, 38), 0);
});
