export type MediaType = 'image' | '3d';

export type ProductionStatus = 'pending' | 'purchasing' | 'production' | 'completed';

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

export interface DeliveryBatchItem extends ProductionItem {
  completedQuantity: number;
}

export interface DeliveryBatch {
  id: string;
  batchNumber: number;
  items: DeliveryBatchItem[];
  dueDate: string;
  destinationCountry: string;
  note?: string;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  product: Product;
  items: ProductionItem[];
  totalQuantity: number;
  deliveryBatches: DeliveryBatch[];
  status: ProductionStatus;
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
