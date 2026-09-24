export type MediaType = 'image' | '3d';

export type ProductionStatus = 'draft' | 'pending' | 'purchasing' | 'production' | 'paused' | 'stopped' | 'cancelled' | 'completed';

export const EU_SHOE_SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45] as const;

export interface Product {
  id: string;
  productCode: string;
  productName: string;
  material: string;
  availableColors: string[];
  mediaType: MediaType;
  mediaUrl: string;
}

export interface ProductionItem {
  color: string;
  quantity: number;
}

export interface SizeQuantity {
  size: typeof EU_SHOE_SIZES[number];
  quantity: number;
}

export interface OrderItem extends ProductionItem {
  sizeQuantities?: SizeQuantity[];
  sizeQuantitiesSample?: boolean;
}

export interface DeliveryBatchItem extends ProductionItem {
  completedQuantity: number;
  defectiveQuantity: number;
  sizeQuantities?: SizeQuantity[];
}

export interface DeliveryBatch {
  id: string;
  batchNumber: number;
  productionLine: string;
  items: DeliveryBatchItem[];
  dueDate: string;
  destinationCountry: string;
  note?: string;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  productSequence?: number;
  product: Product;
  items: OrderItem[];
  totalQuantity: number;
  deliveryBatches: DeliveryBatch[];
  status: ProductionStatus;
  statusReason?: string;
  createdAt: string;
}

export interface WorkflowStep {
  id: ProductionStatus;
  label: string;
}

export interface NewOrderDraft {
  productId: string | null;
  selectedColors: string[];
  quantities: Record<string, number>;
  batches: DeliveryBatch[];
}
