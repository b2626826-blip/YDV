export const formatOrderNumber = (year: number, sequence: number) => `PO-${year}-${String(sequence).padStart(5, '0')}`;

export const getNextOrderSequence = (orderNumbers: readonly string[], year: number) => {
  const matcher = new RegExp(`^PO-${year}-(\\d{5})$`);
  const latest = orderNumbers.reduce((max, orderNumber) => {
    const match = orderNumber.match(matcher);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return latest + 1;
};

export const formatProductOrderNumber = (orderNumber: string, productSequence: number) => `${orderNumber}-P${String(productSequence).padStart(2, '0')}`;

export const formatShipmentBatchNumber = (orderNumber: string, productSequence: number, batchSequence: number) => `${formatProductOrderNumber(orderNumber, productSequence)}-B${String(batchSequence).padStart(2, '0')}`;

export const assignOrderGroup = <T extends { orderNumber: string }>(orders: readonly T[], orderNumber: string) => orders.map((order, index) => ({ ...order, orderNumber, productSequence: index + 1 }));
