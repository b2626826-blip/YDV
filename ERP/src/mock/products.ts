import { PRODUCT_MEDIA } from '../config/productMedia';
import type { Product } from '../types/production';

export const products: Product[] = [
  { id: 'product-a2387', productCode: 'A2387', productName: 'Running Outsole A2387', material: 'EVA / Rubber', availableColors: ['Black', 'White', 'Grey', 'Red'], mediaType: PRODUCT_MEDIA.a2387.type, mediaUrl: PRODUCT_MEDIA.a2387.url },
  { id: 'product-b1042', productCode: 'B1042', productName: 'Trail Grip Outsole B1042', material: 'Rubber / TPR', availableColors: ['Black', 'Olive', 'Sand'], mediaType: PRODUCT_MEDIA.b1042.type, mediaUrl: PRODUCT_MEDIA.b1042.url },
  { id: 'product-c5510', productCode: 'C5510', productName: 'Cloud Runner Sole C5510', material: 'EVA / Foam', availableColors: ['White', 'Sky Blue', 'Navy'], mediaType: PRODUCT_MEDIA.c5510.type, mediaUrl: PRODUCT_MEDIA.c5510.url },
  { id: 'product-d8831', productCode: 'D8831', productName: 'Court Classic Outsole D8831', material: 'Rubber', availableColors: ['White', 'Gum', 'Black'], mediaType: PRODUCT_MEDIA.d8831.type, mediaUrl: PRODUCT_MEDIA.d8831.url },
  { id: 'product-e7712', productCode: 'E7712', productName: 'Flex Sport Sole E7712', material: 'EVA / TPU', availableColors: ['Grey', 'Red', 'Lime'], mediaType: PRODUCT_MEDIA.e7712.type, mediaUrl: PRODUCT_MEDIA.e7712.url },
  { id: 'product-f3208', productCode: 'F3208', productName: 'Urban Slip Outsole F3208', material: 'Rubber / EVA', availableColors: ['Black', 'Beige', 'White'], mediaType: PRODUCT_MEDIA.f3208.type, mediaUrl: PRODUCT_MEDIA.f3208.url },
];
