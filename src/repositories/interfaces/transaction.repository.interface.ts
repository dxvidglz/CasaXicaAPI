import { Transaction, CreateTransactionDto } from '../../types';

export interface ITransactionRepository {
  createTransaction(dto: CreateTransactionDto): Promise<void>;
  getTransactionById(id: number): Promise<Transaction | null>;
  getTransactionsByOrderId(orderId: string): Promise<Transaction[]>;
}
