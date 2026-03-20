import { SupabaseClient } from '@supabase/supabase-js';
import { IProductRepository } from '../interfaces/product.repository.interface';
import { Product, ProductVariant, CreateProductDto, UpdateProductDto } from '../../types';
import { handleSupabaseError } from '../../utils/error.handler';

export class ProductSupabaseRepository implements IProductRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const { data: productData, error: productError } = await this.supabase
      .from('products')
      .insert({
        category_id: dto.categoryId,
        name: dto.name,
        price: dto.price,
        available: dto.available ?? true
      })
      .select()
      .single();

    if (productError) handleSupabaseError(productError, 'Error creating product');

    if (dto.variants && dto.variants.length > 0) {
      const variantsPayload = dto.variants.map((v: any) => ({
        product_id: productData.id,
        name: v.name,
        price_override: v.priceOverride,
        available: v.available ?? true
      }));

      const { error: variantError } = await this.supabase
        .from('product_variants')
        .insert(variantsPayload);

      if (variantError) handleSupabaseError(variantError, 'Error creating product variants');
    }

    return this.getProductById(productData.id) as Promise<Product>;
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        categories (*),
        product_variants (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
       if (error.code === 'PGRST116') return null;
       handleSupabaseError(error, 'Error fetching product');
    }

    return this.mapToDomain(data);
  }

  async getProducts(categoryId?: number): Promise<Product[]> {
    let query = this.supabase
      .from('products')
      .select(`
        *,
        categories (*),
        product_variants (*)
      `)
      .order('name');
      
    if (categoryId) {
       query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) handleSupabaseError(error, 'Error fetching products');

    return (data || []).map(row => this.mapToDomain(row));
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const updatePayload: any = {};
    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.price !== undefined) updatePayload.price = dto.price;
    if (dto.categoryId !== undefined) updatePayload.category_id = dto.categoryId;
    if (dto.available !== undefined) updatePayload.available = dto.available;

    const { error } = await this.supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id);

    if (error) handleSupabaseError(error, 'Error updating product');

    return this.getProductById(id) as Promise<Product>;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.supabase.from('products').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'Error deleting product');
  }

  /**
   * Transforma las filas generadas por el Join de Supabase a nuestro modelo.
   */
  private mapToDomain(row: any): Product {
    return {
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      price: row.price,
      available: row.available,
      category: row.categories ? {
        id: row.categories.id,
        name: row.categories.name
      } : undefined,
      variants: (row.product_variants || []).map((v: any) => ({
        id: v.id,
        productId: v.product_id,
        name: v.name,
        priceOverride: v.price_override,
        available: v.available
      } as ProductVariant))
    };
  }
}
