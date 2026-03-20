import { Category } from './category.types';

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  priceOverride: number;
  available: boolean;
}

export interface Product {
  id: string;
  categoryId: number;
  name: string;
  price: number;
  available: boolean;
  
  category?: Category;
  variants?: ProductVariant[];
}

export interface CreateProductVariantDto {
  name: string;
  priceOverride: number;
  available?: boolean;
}

export interface CreateProductDto {
  categoryId: number;
  name: string;
  price: number;
  available?: boolean;
  variants?: CreateProductVariantDto[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}
