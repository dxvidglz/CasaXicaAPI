import { IProductRepository } from '../repositories/interfaces/product.repository.interface';
import { Product, CreateProductDto, UpdateProductDto } from '../types';
import { Redis } from '@upstash/redis/cloudflare';

export class ProductsService {
  private readonly CACHE_TTL = 3600; // 1 Hora, el menú escasamente cambia

  constructor(
    private readonly repository: IProductRepository,
    private readonly redis: Redis
  ) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const product = await this.repository.createProduct(dto);
    await this.invalidateCache(product.categoryId);
    return product;
  }

  async getProductById(id: string): Promise<Product | null> {
    const cacheKey = `product:${id}`;
    
    const cached = await this.redis.get<Product>(cacheKey);
    if (cached) return cached;

    const product = await this.repository.getProductById(id);
    if (product) await this.redis.set(cacheKey, product, { ex: this.CACHE_TTL });
    
    return product;
  }

  async getProducts(categoryId?: number): Promise<Product[]> {
    const cacheKey = `products:category:${categoryId || 'all'}`;
    
    const cached = await this.redis.get<Product[]>(cacheKey);
    if (cached) return cached;

    const products = await this.repository.getProducts(categoryId);
    await this.redis.set(cacheKey, products, { ex: this.CACHE_TTL });
    
    return products;
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const previous = await this.getProductById(id);
    const updated = await this.repository.updateProduct(id, dto);
    
    await this.redis.del(`product:${id}`);
    
    // Invalida cache de todos los listings si cambia datos básicos de despliegue
    await this.invalidateCache(updated.categoryId);
    
    // Por si movimos el producto a otra categoría, doble limpieza!
    if (previous && previous.categoryId !== updated.categoryId) {
        await this.invalidateCache(previous.categoryId);
    }
    
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.getProductById(id);
    await this.repository.deleteProduct(id);
    
    await this.redis.del(`product:${id}`);
    if (product) await this.invalidateCache(product.categoryId);
  }

  /**
   * Helper para purgar las listas pre-calculadas en Redis
   */
  private async invalidateCache(categoryId: number) {
    await this.redis.del(`products:category:all`);
    await this.redis.del(`products:category:${categoryId}`);
  }
}
