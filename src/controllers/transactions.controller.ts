import { Context } from 'hono';
import { CreateTransactionDto, PaymentMethod } from '../types';
import { TransactionsService } from '../services/transactions.service';
import { handleApiError, AppError } from '../utils/error.handler';

export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  async createTransaction(c: Context) {
    try {
      const body = await c.req.json<CreateTransactionDto>();
      if (!body.orderId || !body.paymentMethod || body.amountPaid === undefined) {
         throw new AppError('orderId, paymentMethod y amountPaid son obligatorios', 400);
      }
      
      const allowedMethods = ['CASH', 'CARD', 'TRANSFER'];
      if (!allowedMethods.includes(body.paymentMethod)) {
        throw new AppError(`paymentMethod inválido. Debe ser: ${allowedMethods.join(', ')}`, 400);
      }

      await this.transactionsService.createTransaction(body);
      return c.json({ success: true }, 201);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  async getTransactionById(c: Context) {
    try {
      const idParam = c.req.param('id');
      if (!idParam) throw new AppError('El ID de transacción es obligatorio', 400);
      const id = parseInt(idParam, 10);
      if (isNaN(id)) throw new AppError('ID de transacción inválido', 400);

      const result = await this.transactionsService.getTransactionById(id);
      if (!result) throw new AppError('Transacción no encontrada', 404);
      
      return c.json({ data: result }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }

  async getTransactionsByOrder(c: Context) {
    try {
      const orderId = c.req.param('orderId');
      if (!orderId) throw new AppError('El ID de la orden es obligatorio', 400);

      const result = await this.transactionsService.getTransactionsByOrderId(orderId);
      return c.json({ data: result }, 200);
    } catch (error: any) {
      return handleApiError(c, error);
    }
  }
}
