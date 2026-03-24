import { ICategoryRepository } from '../repositories/interfaces/category.repository.interface';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types';
import { Redis } from '@upstash/redis/cloudflare';

export class CategoriesService {
  private readonly CACHE_TTL = 86400; // 24 Horas

  constructor(
    private readonly repository: ICategoryRepository,
    private readonly redis: Redis
  ) {}

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    return this.repository.createCategory(dto);
  }

  async getCategoryById(id: number): Promise<Category | null> {
    const cacheKey = `category:${id}`;
    const cached = await this.redis.get<Category>(cacheKey);
    if (cached) return cached;

    const category = await this.repository.getCategoryById(id);
    if (category) await this.redis.set(cacheKey, category, { ex: this.CACHE_TTL });
    
    return category;
  }

  async getCategories(): Promise<Category[]> {
    const cacheKey = `categories:all`;
    const cached = await this.redis.get<Category[]>(cacheKey);
    if (cached) return cached;

    const categories = await this.repository.getCategories();
    await this.redis.set(cacheKey, categories, { ex: this.CACHE_TTL });
    
    return categories;
  }

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<Category> {
    return this.repository.updateCategory(id, dto);
  }

  async deleteCategory(id: number): Promise<void> {
    await this.repository.deleteCategory(id);
  }
}
