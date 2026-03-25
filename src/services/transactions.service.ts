import { ITransactionRepository } from '../repositories/interfaces/transaction.repository.interface';
import { Transaction, CreateTransactionDto } from '../types';

export class TransactionsService {
  constructor(
    private readonly repository: ITransactionRepository
  ) {}

  async createTransaction(dto: CreateTransactionDto): Promise<void> {
    await this.repository.createTransaction(dto);
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    return this.repository.getTransactionById(id);
  }

  async getTransactionsByOrderId(orderId: string): Promise<Transaction[]> {
    return this.repository.getTransactionsByOrderId(orderId);
  }
}
