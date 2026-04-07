import { SupabaseClient } from '@supabase/supabase-js';
import { IOrderRepository } from '../interfaces/order.repository.interface';
import { Order, CreateOrderDto, OrderStatus, ItemStatus } from '../../types';
import { handleSupabaseError } from '../../utils/error.handler';

export class OrderSupabaseRepository implements IOrderRepository {
  constructor(private readonly supabase: SupabaseClient) { }

  async createOrder(orderDto: CreateOrderDto): Promise<void> {
    const newOrderPayload = {
      table_number: orderDto.tableNumber ?? null,
      waiter_id: orderDto.waiterId,
    };

    const { data: orderData, error: orderError } = await this.supabase
      .from('orders')
      .insert(newOrderPayload)
      .select('id')
      .single();

    if (orderError) {
      handleSupabaseError(orderError, 'Error al crear la cabecera de la orden en Supabase');
    }
    if (!orderData) return;

    // Insertar los detalles iterando los items (tabla order_items)
    if (orderDto.items && orderDto.items.length > 0) {
      const detailsPayload = orderDto.items.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        notes: item.notes
      }));

      const { data: detailsData, error: detailsError } = await this.supabase
        .from('order_items')
        .insert(detailsPayload)
        .select('id');

      if (detailsError) {
        handleSupabaseError(detailsError, 'Error al crear los detalles de la orden');
      }

      // Inserción Anidada de Variantes (tabla order_item_variants)
      // Recorremos los details insertados localizando si el DTO original propuso "variantIds"
      const variantsPayload: any[] = [];
      detailsData?.forEach((insertedItem, index) => {
        const originalDtoItem = orderDto.items[index];
        if (originalDtoItem.variantIds && originalDtoItem.variantIds.length > 0) {
          originalDtoItem.variantIds.forEach(variantId => {
            variantsPayload.push({
              order_item_id: insertedItem.id,
              variant_id: variantId,
            });
          });
        }
      });

      if (variantsPayload.length > 0) {
        const { error: variantsError } = await this.supabase
          .from('order_item_variants')
          .insert(variantsPayload);

        if (variantsError) {
          handleSupabaseError(variantsError, 'Error insertando las variantes');
        }
      }
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    // PostgREST Joins: Traemos las órdenes con sus order_items anidados, y estos con sus order_item_variants
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          order_item_variants (*)
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

  async getOrdersByStatus(status?: OrderStatus, userRole?: string): Promise<Order[]> {
    let query = this.supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    } 
    else if (userRole !== 'ADMIN') {
      const startOfDay = new Date();
      startOfDay.setHours(6, 0, 0, 0); // Desde las 12:00 AM
      query = query.gte('created_at', startOfDay.toISOString());
      // query = query.neq('status', 'CLOSED');
    }

    const { data, error } = await query;

    if (error) {
      handleSupabaseError(error, 'Error al listar orders');
    }

    return (data || []).map(row => this.mapToDomain(row));
  }

  async updateOrderItemStatus(orderId: string, itemId: string, status: ItemStatus): Promise<void> {
    const { error } = await this.supabase
      .from('order_items')
      .update({ status: status })
      .eq('id', itemId)
      .eq('order_id', orderId);

    if (error) {
      handleSupabaseError(error, 'Error al actualizar estado del detalle de la orden');
    }
  }

  /**
   * Helper privado para transformar la data cruda de Supabase multi-tabla (Joins postgREST)
   * a un modelo estándar de TypeScript orientado a objetos que usa Hono/Frontend
   */
  private mapToDomain(row: any): Order {
    return {
      id: row.id,
      dailyFolio: row.daily_folio,
      ...(row.table_number != null && { tableNumber: row.table_number }),
      waiterId: row.waiter_id,
      waiterName: row.waiter_name,
      status: row.status as OrderStatus,
      total: row.total,
      totalItems: row.total_items,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      ...(row.order_items && {
        items: row.order_items.map((detail: any) => {
          const variants = (detail.order_item_variants || []).map((v: any) => ({
            id: v.id,
            variantId: v.variant_id,
            name: v.variant_name,
            price: v.price
          }));

          return {
            id: detail.id,
            productId: detail.product_id,
            name: detail.product_name,
            ...(detail.notes != null && { notes: detail.notes }),
            unitPrice: detail.unit_price,
            status: detail.status as ItemStatus,
            ...(variants.length > 0 && { variants })
          };
        })
      })
    };
  }
}
