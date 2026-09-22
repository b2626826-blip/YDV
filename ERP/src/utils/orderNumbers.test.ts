import assert from 'node:assert/strict';
import test from 'node:test';
import { assignOrderGroup, formatProductOrderNumber, formatShipmentBatchNumber, formatOrderNumber, getNextOrderSequence } from './orderNumbers.ts';

test('formats the master order number with a five-digit sequence', () => {
  assert.equal(formatOrderNumber(2026, 9041), 'PO-2026-09041');
});

test('finds the next sequence for the selected year only', () => {
  assert.equal(getNextOrderSequence(['PO-2025-99999', 'PO-2026-09040', 'invalid'], 2026), 9041);
});

test('formats product and shipment batch numbers beneath a master order', () => {
  assert.equal(formatProductOrderNumber('PO-2026-09041', 2), 'PO-2026-09041-P02');
  assert.equal(formatShipmentBatchNumber('PO-2026-09041', 2, 1), 'PO-2026-09041-P02-B01');
  assert.equal(formatShipmentBatchNumber('PO-2026-09041', 2, 12), 'PO-2026-09041-P02-B12');
});

test('assigns one master order number and sequential product numbers to one submission', () => {
  const numbered = assignOrderGroup([{ id: 'a', orderNumber: '' }, { id: 'b', orderNumber: '' }, { id: 'c', orderNumber: '' }], 'PO-2026-09011');
  assert.deepEqual(numbered, [
    { id: 'a', orderNumber: 'PO-2026-09011', productSequence: 1 },
    { id: 'b', orderNumber: 'PO-2026-09011', productSequence: 2 },
    { id: 'c', orderNumber: 'PO-2026-09011', productSequence: 3 },
  ]);
});
