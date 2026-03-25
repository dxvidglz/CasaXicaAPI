import { Context } from 'hono';
import { CreateCategoryDto, UpdateCategoryDto } from '../types';
import { CategoriesService } from '../services/categories.service';
import { handleApiError, AppError } from '../utils/error.handler';

export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  async createCategory(c: Context) {
    try {
      const body = await c.req.json<CreateCategoryDto>();
      if (!body.name) {
         throw new AppError('El nombre (name) es obligatorio', 400);
      }
      await this.categoriesService.createCategory(body);
      return c.json({ success: true }, 201);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  async getCategoryById(c: Context) {
    try {
      const idParam = c.req.param('id');
      if (!idParam) throw new AppError('El ID de categoría es obligatorio', 400);
      const id = parseInt(idParam, 10);
      if (isNaN(id)) throw new AppError('El ID de categoría debe ser un número', 400);

      const result = await this.categoriesService.getCategoryById(id);
      if (!result) throw new AppError('Categoría no encontrada', 404);
      
      return c.json({ data: result }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  async getCategories(c: Context) {
    try {
      const result = await this.categoriesService.getCategories();
      return c.json({ data: result }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  async updateCategory(c: Context) {
    try {
      const idParam = c.req.param('id');
      if (!idParam) throw new AppError('El ID de categoría es obligatorio', 400);
      const id = parseInt(idParam, 10);
      if (isNaN(id)) throw new AppError('El ID de categoría debe ser un número', 400);
      
      const body = await c.req.json<UpdateCategoryDto>();
      if (!body.name) throw new AppError('El nombre es requerido para actualizar', 400);

      await this.categoriesService.updateCategory(id, body);
      return c.json({ success: true }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  async deleteCategory(c: Context) {
    try {
      const idParam = c.req.param('id');
      if (!idParam) throw new AppError('El ID de categoría es obligatorio', 400);
      const id = parseInt(idParam, 10);
      if (isNaN(id)) throw new AppError('El ID de categoría debe ser un número', 400);
      
      await this.categoriesService.deleteCategory(id);
      return c.json({ data: { deleted: true } }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }
}
