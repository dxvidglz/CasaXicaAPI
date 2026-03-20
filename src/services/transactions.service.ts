import { ITransactionRepository } from '../repositories/interfaces/transaction.repository.interface';
import { Transaction, CreateTransactionDto } from '../types';
import { Redis } from '@upstash/redis/cloudflare';

export class TransactionsService {
  constructor(
    private readonly repository: ITransactionRepository,
    private readonly redis: Redis
  ) {}

  async createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = await this.repository.createTransaction(dto);
    
    // Al registrar un pago válido, asumimos que el estado o saldos de la Orden cambiarán.
    // Invalidamos radicalmente la caché de esa orden para que el Frontend la refresque seca.
    await this.redis.del(`order:${dto.orderId}`);
    
    return transaction;
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    // Al ser un reporte contable y estricto, es preferible consultar a DB 
    // y evitar latencias de caché por integridad transaccional.
    return this.repository.getTransactionById(id);
  }

  async getTransactionsByOrderId(orderId: string): Promise<Transaction[]> {
    return this.repository.getTransactionsByOrderId(orderId);
  }
}
