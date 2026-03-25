export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

export interface Transaction {
  id: number;
  orderId: string;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  ticketFolio: number;
  paidAt: string;
}

export interface CreateTransactionDto {
  orderId: string;
  paymentMethod: PaymentMethod;
  amountPaid: number;
}
