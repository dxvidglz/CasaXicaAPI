import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../types';

export interface ICategoryRepository {
  createCategory(category: CreateCategoryDto): Promise<Category>;
  getCategoryById(id: number): Promise<Category | null>;
  getCategories(): Promise<Category[]>;
  updateCategory(id: number, category: UpdateCategoryDto): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
}
