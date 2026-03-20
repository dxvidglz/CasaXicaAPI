import { SupabaseClient } from '@supabase/supabase-js';
import { ICategoryRepository } from '../interfaces/category.repository.interface';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../types';
import { handleSupabaseError } from '../../utils/error.handler';

export class CategorySupabaseRepository implements ICategoryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .insert({ name: dto.name })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'Error creando la categoría en base de datos');

    return this.mapToDomain(data);
  }

  async getCategoryById(id: number): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
       if (error.code === 'PGRST116') return null;
       handleSupabaseError(error, 'Error consultando la categoría');
    }

    return this.mapToDomain(data);
  }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) handleSupabaseError(error, 'Error listando las categorías');

    return (data || []).map(row => this.mapToDomain(row));
  }

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .update({ name: dto.name })
      .eq('id', id)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'Error actualizando la categoría');

    return this.mapToDomain(data);
  }

  async deleteCategory(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id);
      
    if (error) handleSupabaseError(error, 'Error eliminando la categoría (revisa si tiene productos asociados)');
  }

  private mapToDomain(row: any): Category {
    return {
      id: row.id,
      name: row.name
    };
  }
}
