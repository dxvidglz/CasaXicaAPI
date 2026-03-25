import { SupabaseClient } from '@supabase/supabase-js';
import { ITransactionRepository } from '../interfaces/transaction.repository.interface';
import { Transaction, CreateTransactionDto } from '../../types';
import { handleSupabaseError } from '../../utils/error.handler';

export class TransactionSupabaseRepository implements ITransactionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createTransaction(dto: CreateTransactionDto): Promise<void> {
    const { error } = await this.supabase
      .from('transactions')
      .insert({
        order_id: dto.orderId,
        payment_method: dto.paymentMethod,
        amount_paid: dto.amountPaid,
      });

    if (error) handleSupabaseError(error, 'Error al procesar la transacción');
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleSupabaseError(error, 'Error obteniendo transacción');
    }

    return this.mapToDomain(data);
  }

  async getTransactionsByOrderId(orderId: string): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('order_id', orderId)
      .order('paid_at', { ascending: false });

    if (error) handleSupabaseError(error, 'Error listando transacciones de la orden');

    return (data || []).map(row => this.mapToDomain(row));
  }

  private mapToDomain(row: any): Transaction {
    return {
      id: row.id,
      orderId: row.order_id,
      paymentMethod: row.payment_method,
      amountPaid: row.amount_paid,
      change: row.change,
      ticketFolio: row.ticket_folio,
      paidAt: row.paid_at
    };
  }
}
