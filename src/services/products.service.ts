import { IProductRepository } from '../repositories/interfaces/product.repository.interface';
import { Product, CreateProductDto, UpdateProductDto } from '../types';
import { Redis } from '@upstash/redis/cloudflare';

export class ProductsService {
  private readonly CACHE_TTL = 3600; // 1 Hora, el menú escasamente cambia

  constructor(
    private readonly repository: IProductRepository,
    private readonly redis: Redis
  ) {}

  async createProduct(dto: CreateProductDto): Promise<void> {
    await this.repository.createProduct(dto);
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

  async updateProduct(id: string, dto: UpdateProductDto): Promise<void> {
    await this.repository.updateProduct(id, dto);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.repository.deleteProduct(id);
  }
}
