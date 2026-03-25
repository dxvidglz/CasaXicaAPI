import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../types';

export interface ICategoryRepository {
  createCategory(category: CreateCategoryDto): Promise<void>;
  getCategoryById(id: number): Promise<Category | null>;
  getCategories(): Promise<Category[]>;
  updateCategory(id: number, category: UpdateCategoryDto): Promise<void>;
  deleteCategory(id: number): Promise<void>;
}
