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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_event_bookings: {
        Row: {
          booking_id: string
          created_at: string
          event_id: string
          hold_expires_at: string | null
          id: string
          participants: number
          state: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          event_id: string
          hold_expires_at?: string | null
          id?: string
          participants: number
          state?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          event_id?: string
          hold_expires_at?: string | null
          id?: string
          participants?: number
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_event_bookings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_event_bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "activity_events"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_events: {
        Row: {
          capacity_total: number
          category: string
          created_at: string
          ends_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          meeting_point_private: string | null
          meeting_point_public: string | null
          notes: string | null
          price_cents: number | null
          seats_reserved: number
          slug: string
          starts_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          capacity_total?: number
          category: string
          created_at?: string
          ends_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          meeting_point_private?: string | null
          meeting_point_public?: string | null
          notes?: string | null
          price_cents?: number | null
          seats_reserved?: number
          slug: string
          starts_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          capacity_total?: number
          category?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          meeting_point_private?: string | null
          meeting_point_public?: string | null
          notes?: string | null
          price_cents?: number | null
          seats_reserved?: number
          slug?: string
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          activity: string
          admin_notes: string | null
          contact: string
          created_at: string
          email: string | null
          event_id: string | null
          experience_level: string | null
          id: string
          message: string | null
          name: string | null
          number_of_people: string | null
          paid_amount_cents: number | null
          paid_at: string | null
          payment_email: string | null
          payment_reference: string | null
          phone: string | null
          preferred_date: string | null
          rgpd_accepted_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          activity: string
          admin_notes?: string | null
          contact: string
          created_at?: string
          email?: string | null
          event_id?: string | null
          experience_level?: string | null
          id?: string
          message?: string | null
          name?: string | null
          number_of_people?: string | null
          paid_amount_cents?: number | null
          paid_at?: string | null
          payment_email?: string | null
          payment_reference?: string | null
          phone?: string | null
          preferred_date?: string | null
          rgpd_accepted_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          activity?: string
          admin_notes?: string | null
          contact?: string
          created_at?: string
          email?: string | null
          event_id?: string | null
          experience_level?: string | null
          id?: string
          message?: string | null
          name?: string | null
          number_of_people?: string | null
          paid_amount_cents?: number | null
          paid_at?: string | null
          payment_email?: string | null
          payment_reference?: string | null
          phone?: string | null
          preferred_date?: string | null
          rgpd_accepted_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "activity_events"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          admin_notes: string | null
          contacto: string
          created_at: string
          email: string | null
          id: string
          interes: string
          mensaje: string | null
          nombre: string
          paid_amount_cents: number | null
          paid_at: string | null
          payment_reference: string | null
          personas: string | null
          phone: string | null
          rgpd_accepted_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          contacto: string
          created_at?: string
          email?: string | null
          id?: string
          interes: string
          mensaje?: string | null
          nombre: string
          paid_amount_cents?: number | null
          paid_at?: string | null
          payment_reference?: string | null
          personas?: string | null
          phone?: string | null
          rgpd_accepted_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          contacto?: string
          created_at?: string
          email?: string | null
          id?: string
          interes?: string
          mensaje?: string | null
          nombre?: string
          paid_amount_cents?: number | null
          paid_at?: string | null
          payment_reference?: string | null
          personas?: string | null
          phone?: string | null
          rgpd_accepted_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          attempts: number
          booking_id: string | null
          channel: string
          contact_id: string | null
          created_at: string
          dedupe_key: string
          error: string | null
          id: string
          kind: string
          lease_expires_at: string | null
          lease_id: string | null
          next_attempt_at: string
          payload: Json | null
          payment_request_id: string | null
          provider_id: string | null
          provider_idempotency_key: string | null
          recipient: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          booking_id?: string | null
          channel?: string
          contact_id?: string | null
          created_at?: string
          dedupe_key: string
          error?: string | null
          id?: string
          kind: string
          lease_expires_at?: string | null
          lease_id?: string | null
          next_attempt_at?: string
          payload?: Json | null
          payment_request_id?: string | null
          provider_id?: string | null
          provider_idempotency_key?: string | null
          recipient?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          booking_id?: string | null
          channel?: string
          contact_id?: string | null
          created_at?: string
          dedupe_key?: string
          error?: string | null
          id?: string
          kind?: string
          lease_expires_at?: string | null
          lease_id?: string | null
          next_attempt_at?: string
          payload?: Json | null
          payment_request_id?: string | null
          provider_id?: string | null
          provider_idempotency_key?: string | null
          recipient?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "payment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_requests: {
        Row: {
          amount_cents: number
          booking_id: string | null
          checkout_created_at: string | null
          checkout_generation: number
          checkout_session_expired_at: string | null
          concept: string
          contact_id: string | null
          created_at: string
          currency: string
          customer_email: string | null
          environment: string
          expires_at: string
          id: string
          last_error: string | null
          paid_at: string | null
          payment_reference: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          token: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          booking_id?: string | null
          checkout_created_at?: string | null
          checkout_generation?: number
          checkout_session_expired_at?: string | null
          concept: string
          contact_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          environment?: string
          expires_at?: string
          id?: string
          last_error?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          token?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          booking_id?: string | null
          checkout_created_at?: string | null
          checkout_generation?: number
          checkout_session_expired_at?: string | null
          concept?: string
          contact_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          environment?: string
          expires_at?: string
          id?: string
          last_error?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_requests_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_orders: {
        Row: {
          admin_notes: string | null
          amount_cents: number | null
          cancel_at_period_end: boolean
          created_at: string
          currency: string
          current_period_end: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          environment: string
          id: string
          last_invoice_amount_cents: number | null
          last_invoice_at: string | null
          last_invoice_status: string | null
          mode: string
          portal_token: string
          price_id: string
          product_name: string
          status: string
          stripe_customer_id: string | null
          stripe_session_id: string
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount_cents?: number | null
          cancel_at_period_end?: boolean
          created_at?: string
          currency?: string
          current_period_end?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          environment?: string
          id?: string
          last_invoice_amount_cents?: number | null
          last_invoice_at?: string | null
          last_invoice_status?: string | null
          mode: string
          portal_token?: string
          price_id: string
          product_name: string
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount_cents?: number | null
          cancel_at_period_end?: boolean
          created_at?: string
          currency?: string
          current_period_end?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          environment?: string
          id?: string
          last_invoice_amount_cents?: number | null
          last_invoice_at?: string | null
          last_invoice_status?: string | null
          mode?: string
          portal_token?: string
          price_id?: string
          product_name?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      begin_checkout_generation: {
        Args: { _expired_session_id: string; _token: string }
        Returns: Json
      }
      claim_notification: {
        Args: { _id: string; _lease_seconds?: number }
        Returns: Json
      }
      confirm_event_seats: { Args: { _booking_id: string }; Returns: Json }
      confirm_payment_request: {
        Args: {
          _amount_cents: number
          _currency: string
          _customer_email?: string
          _environment: string
          _livemode: boolean
          _notifications?: Json
          _payment_intent_id: string
          _payment_status: string
          _session_id: string
          _token: string
        }
        Returns: Json
      }
      finish_notification: {
        Args: {
          _error?: string
          _id: string
          _lease_id: string
          _provider_id?: string
          _retry_in_seconds?: number
          _status: string
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      record_checkout_session: {
        Args: { _generation: number; _session_id: string; _token: string }
        Returns: Json
      }
      release_expired_event_holds: { Args: never; Returns: number }
      reserve_event_seats: {
        Args: {
          _booking_id: string
          _event_id: string
          _hold_minutes?: number
          _participants: number
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
