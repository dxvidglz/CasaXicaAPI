import { Product, CreateProductDto, UpdateProductDto } from '../../types';

export interface IProductRepository {
  createProduct(product: CreateProductDto): Promise<Product>;
  getProductById(id: string): Promise<Product | null>;
  getProducts(categoryId?: number): Promise<Product[]>;
  updateProduct(id: string, product: UpdateProductDto): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
}
