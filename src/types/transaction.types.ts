export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

export interface TicketItemSummary {
  quantity: number;
  productName: string;
  variantsDescription: string | null;
  unitTotalPrice: number;
  subtotal: number;
}

export interface Transaction {
  id: number;
  orderId: string;
  paymentMethod: PaymentMethod;
  total: number;
  amountPaid: number;
  change: number;
  ticketFolio: number;
  paidAt: string;
  items?: TicketItemSummary[];
}

export interface CreateTransactionDto {
  orderId: string;
  paymentMethod: PaymentMethod;
  amountPaid: number;
}
