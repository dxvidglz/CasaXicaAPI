export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      order_item_variants: {
        Row: {
          id: string
          order_item_id: string
          price: number
          variant_id: string
        }
        Insert: {
          id?: string
          order_item_id: string
          price: number
          variant_id: string
        }
        Update: {
          id?: string
          order_item_id?: string
          price?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_item_variants_order_items_id_foreign"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_variants_variant_id_foreign"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          notes: string | null
          order_id: string
          product_id: string
          status: Database["public"]["Enums"]["status_enum"]
          unit_price: number
          updated_at: string
        }
        Insert: {
          id?: string
          notes?: string | null
          order_id: string
          product_id: string
          status?: Database["public"]["Enums"]["status_enum"]
          unit_price: number
          updated_at?: string
        }
        Update: {
          id?: string
          notes?: string | null
          order_id?: string
          product_id?: string
          status?: Database["public"]["Enums"]["status_enum"]
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_foreign"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_foreign"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          daily_folio: number
          id: string
          status: Database["public"]["Enums"]["status_enum"]
          table_number: string | null
          total: number
          updated_at: string
          waiter_id: string
        }
        Insert: {
          created_at?: string
          daily_folio?: number
          id?: string
          status?: Database["public"]["Enums"]["status_enum"]
          table_number?: string | null
          total?: number
          updated_at?: string
          waiter_id: string
        }
        Update: {
          created_at?: string
          daily_folio?: number
          id?: string
          status?: Database["public"]["Enums"]["status_enum"]
          table_number?: string | null
          total?: number
          updated_at?: string
          waiter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_waiter_id_foreign"
            columns: ["waiter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          available: boolean
          id: string
          name: string
          price_override: number
          product_id: string
        }
        Insert: {
          available?: boolean
          id?: string
          name: string
          price_override: number
          product_id: string
        }
        Update: {
          available?: boolean
          id?: string
          name?: string
          price_override?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_foreign"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          available: boolean
          category_id: number
          id: string
          name: string
          price: number
        }
        Insert: {
          available?: boolean
          category_id: number
          id?: string
          name: string
          price: number
        }
        Update: {
          available?: boolean
          category_id?: number
          id?: string
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_foreign"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_paid: number
          id: number
          order_id: string
          paid_at: string
          payment_method: Database["public"]["Enums"]["payment_method_enum"]
          ticket_folio: number
        }
        Insert: {
          amount_paid: number
          id?: number
          order_id: string
          paid_at?: string
          payment_method: Database["public"]["Enums"]["payment_method_enum"]
          ticket_folio?: number
        }
        Update: {
          amount_paid?: number
          id?: number
          order_id?: string
          paid_at?: string
          payment_method?: Database["public"]["Enums"]["payment_method_enum"]
          ticket_folio?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_foreign"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          role: Database["public"]["Enums"]["role_enum"]
        }
        Insert: {
          active?: boolean
          created_at?: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["role_enum"]
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["role_enum"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reset_daily_folio: { Args: never; Returns: undefined }
      update_order_total: { Args: { p_order_id: string }; Returns: undefined }
    }
    Enums: {
      payment_method_enum: "CASH" | "CARD" | "TRANSFER"
      role_enum: "ADMIN" | "WAITER" | "KITCHEN"
      status_enum:
        | "PENDING"
        | "PREPARING"
        | "READY"
        | "DELIVERED"
        | "CLOSED"
        | "CANCELLED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      payment_method_enum: ["CASH", "CARD", "TRANSFER"],
      role_enum: ["ADMIN", "WAITER", "KITCHEN"],
      status_enum: [
        "PENDING",
        "PREPARING",
        "READY",
        "DELIVERED",
        "CLOSED",
        "CANCELLED",
      ],
    },
  },
} as const
