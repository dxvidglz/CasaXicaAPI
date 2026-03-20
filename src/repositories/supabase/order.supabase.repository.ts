import { SupabaseClient } from '@supabase/supabase-js';
import { IOrderRepository } from '../interfaces/order.repository.interface';
import { Order, CreateOrderDto, OrderStatus } from '../../types';
import { handleSupabaseError } from '../../utils/error.handler';

export class OrderSupabaseRepository implements IOrderRepository {
  constructor(private readonly supabase: SupabaseClient) { }

  async createOrder(orderDto: CreateOrderDto): Promise<Order> {
    const newOrderPayload = {
      table_number: orderDto.tableNumber,
      waiter_id: orderDto.waiterId,
      status: 'PENDING' as OrderStatus,
      total: 0 // Se calcula mediante un trigger en DB basado en order_details
    };

    const { data: orderData, error: orderError } = await this.supabase
      .from('orders')
      .insert(newOrderPayload)
      .select()
      .single();

    if (orderError) {
      handleSupabaseError(orderError, 'Error al crear la cabecera de la orden en Supabase');
    }

    // Insertar los detalles iterando los items (tabla order_details)
    if (orderDto.items && orderDto.items.length > 0) {
      const detailsPayload = orderDto.items.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        quantity: item.quantity,
        notes: item.notes,
        item_status: 'PENDING',
        unit_price: 0 // Valor transitorio. Un trigger jala el precio desde tabla products
      }));

      const { data: detailsData, error: detailsError } = await this.supabase
        .from('order_details')
        .insert(detailsPayload)
        .select();

      if (detailsError) {
        handleSupabaseError(detailsError, 'Error al crear los detalles de la orden');
      }

      // Inserción Anidada de Variantes (tabla order_details_variants)
      // Recorremos los details insertados localizando si el DTO original propuso "variantIds"
      const variantsPayload: any[] = [];
      detailsData?.forEach((insertedItem, index) => {
        const originalDtoItem = orderDto.items[index];
        if (originalDtoItem.variantIds && originalDtoItem.variantIds.length > 0) {
          originalDtoItem.variantIds.forEach(variantId => {
            variantsPayload.push({
              order_detail_id: insertedItem.id,
              variant_id: variantId,
              price: 0 // Valor transitorio
            });
          });
        }
      });

      if (variantsPayload.length > 0) {
        const { error: variantsError } = await this.supabase
          .from('order_details_variants')
          .insert(variantsPayload);

        if (variantsError) {
          handleSupabaseError(variantsError, 'Error insertando las variantes');
        }
      }
    }

    return this.getOrderById(orderData.id) as Promise<Order>;
  }

  async getOrderById(id: string): Promise<Order | null> {
    // PostgREST Joins: Traemos las órdenes con sus order_details anidados, y estos con sus order_details_variants
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_details (
          *,
          order_details_variants (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleSupabaseError(error, 'Error al obtener order');
    }

    return this.mapToDomain(data);
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_details (
          *,
          order_details_variants (*)
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'Error al listar orders');
    }

    return (data || []).map(row => this.mapToDomain(row));
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const { error } = await this.supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      handleSupabaseError(error, 'Error al actualizar estado de orden');
    }

    return this.getOrderById(id) as Promise<Order>;
  }

  /**
   * Helper privado para transformar la data cruda de Supabase multi-tabla (Joins postgREST)
   * a un modelo estándar de TypeScript orientado a objetos que usa Hono/Frontend
   */
  private mapToDomain(row: any): Order {
    return {
      id: row.id,
      dailyFolio: row.daily_folio,
      tableNumber: row.table_number,
      waiterId: row.waiter_id,
      status: row.status as OrderStatus,
      total: row.total,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      items: (row.order_details || []).map((detail: any) => ({
        id: detail.id,
        productId: detail.product_id,
        quantity: detail.quantity,
        notes: detail.notes,
        unitPrice: detail.unit_price,
        itemStatus: detail.item_status,
        variants: (detail.order_details_variants || []).map((v: any) => ({
          id: v.id,
          variantId: v.variant_id,
          price: v.price
        }))
      }))
    };
  }
}
