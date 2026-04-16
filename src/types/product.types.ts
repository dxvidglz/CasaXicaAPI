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

export interface UpdateProductVariantDto {
  id?: string; // Presente para variantes existentes, ausente para nuevas
  name: string;
  priceOverride: number;
  available?: boolean;
}

export interface UpdateProductDto {
  categoryId?: number;
  name?: string;
  price?: number;
  available?: boolean;
  variants?: UpdateProductVariantDto[];
}
