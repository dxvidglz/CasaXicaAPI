import { Context } from 'hono';
import { CreateProductDto, UpdateProductDto } from '../types';
import { ProductsService } from '../services/products.service';
import { handleApiError, AppError } from '../utils/error.handler';

export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  async createProduct(c: Context) {
    try {
      const body = await c.req.json<CreateProductDto>();
      
      const result = await this.productsService.createProduct(body);
      return c.json({ data: result }, 201);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  async getProductById(c: Context) {
    try {
      const id = c.req.param('id');
      if (!id) throw new AppError('El ID del producto es obligatorio', 400);

      const result = await this.productsService.getProductById(id);
      
      if (!result) {
        throw new AppError('Product not found', 404);
      }
      
      return c.json({ data: result }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  async getProducts(c: Context) {
    try {
      const categoryId = c.req.query('categoryId');
      const parsedCategoryId = categoryId ? parseInt(categoryId as string, 10) : undefined;

      const result = await this.productsService.getProducts(parsedCategoryId);
      return c.json({ data: result }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  async updateProduct(c: Context) {
    try {
      const id = c.req.param('id');
      if (!id) throw new AppError('El ID del producto es obligatorio', 400);
      const body = await c.req.json<UpdateProductDto>();
      
      if (Object.keys(body).length === 0) {
        throw new AppError('No attributes sent to update', 400);
      }

      const result = await this.productsService.updateProduct(id, body);
      return c.json({ data: result }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  async deleteProduct(c: Context) {
    try {
      const id = c.req.param('id');
      if (!id) throw new AppError('El ID del producto es obligatorio', 400);
      await this.productsService.deleteProduct(id);
      return c.json({ data: { deleted: true } }, 200); 
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }
}
