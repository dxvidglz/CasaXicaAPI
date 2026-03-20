import { Transaction, CreateTransactionDto } from '../../types';

export interface ITransactionRepository {
  createTransaction(dto: CreateTransactionDto): Promise<Transaction>;
  getTransactionById(id: number): Promise<Transaction | null>;
  getTransactionsByOrderId(orderId: string): Promise<Transaction[]>;
}
