import { products } from '../mock/products';
import type { Product } from '../types/production';

export const productService = {
  list: (): Product[] => products.map((product) => ({ ...product, availableColors: [...product.availableColors] })),
};
