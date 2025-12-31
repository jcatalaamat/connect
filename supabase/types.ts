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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          goal: number
          id: string
          name: string
          profile_id: string | null
          progress: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          goal: number
          id?: string
          name: string
          profile_id?: string | null
          progress: number
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          goal?: number
          id?: string
          name?: string
          profile_id?: string | null
          progress?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          booking_id: string | null
          created_at: string | null
          end_time: string
          id: string
          is_booked: boolean | null
          offering_id: string
          start_time: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          is_booked?: boolean | null
          offering_id: string
          start_time: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          is_booked?: boolean | null
          offering_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount_cents: number
          availability_slot_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          confirmation_code: string
          confirmation_sent_at: string | null
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_name: string
          customer_notes: string | null
          customer_phone: string | null
          event_date_id: string | null
          id: string
          internal_notes: string | null
          offering_id: string
          platform_fee_cents: number
          practitioner_amount_cents: number
          refund_amount_cents: number | null
          spots_booked: number | null
          status: Database["public"]["Enums"]["booking_status"] | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          availability_slot_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmation_code: string
          confirmation_sent_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_name: string
          customer_notes?: string | null
          customer_phone?: string | null
          event_date_id?: string | null
          id?: string
          internal_notes?: string | null
          offering_id: string
          platform_fee_cents: number
          practitioner_amount_cents: number
          refund_amount_cents?: number | null
          spots_booked?: number | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          availability_slot_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmation_code?: string
          confirmation_sent_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string | null
          event_date_id?: string | null
          id?: string
          internal_notes?: string | null
          offering_id?: string
          platform_fee_cents?: number
          practitioner_amount_cents?: number
          refund_amount_cents?: number | null
          spots_booked?: number | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_availability_slot_id_fkey"
            columns: ["availability_slot_id"]
            isOneToOne: false
            referencedRelation: "availability_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_event_date_id_fkey"
            columns: ["event_date_id"]
            isOneToOne: false
            referencedRelation: "event_dates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          country: string
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          platform_fee_percent: number | null
          slug: string
          timezone: string
          updated_at: string | null
        }
        Insert: {
          country: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          platform_fee_percent?: number | null
          slug: string
          timezone: string
          updated_at?: string | null
        }
        Update: {
          country?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          platform_fee_percent?: number | null
          slug?: string
          timezone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      city_admins: {
        Row: {
          city_id: string
          created_at: string | null
          id: string
          profile_id: string
          role: string | null
        }
        Insert: {
          city_id: string
          created_at?: string | null
          id?: string
          profile_id: string
          role?: string | null
        }
        Update: {
          city_id?: string
          created_at?: string | null
          id?: string
          profile_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_admins_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_admins_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_dates: {
        Row: {
          capacity_override: number | null
          created_at: string | null
          end_time: string
          id: string
          offering_id: string
          spots_remaining: number
          start_time: string
        }
        Insert: {
          capacity_override?: number | null
          created_at?: string | null
          end_time: string
          id?: string
          offering_id: string
          spots_remaining: number
          start_time: string
        }
        Update: {
          capacity_override?: number | null
          created_at?: string | null
          end_time?: string
          id?: string
          offering_id?: string
          spots_remaining?: number
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_dates_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          name: string
          profile_id: string | null
          start_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          name: string
          profile_id?: string | null
          start_time?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          name?: string
          profile_id?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      installs: {
        Row: {
          expo_tokens: string[] | null
          user_id: string
        }
        Insert: {
          expo_tokens?: string[] | null
          user_id: string
        }
        Update: {
          expo_tokens?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      offerings: {
        Row: {
          capacity: number | null
          cover_image_url: string | null
          created_at: string | null
          currency: string | null
          deposit_percent: number | null
          deposit_required: boolean | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          location_address: string | null
          location_notes: string | null
          location_type: string | null
          practitioner_id: string
          price_cents: number
          title: string
          type: Database["public"]["Enums"]["offering_type"]
          updated_at: string | null
          virtual_link: string | null
        }
        Insert: {
          capacity?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          deposit_percent?: number | null
          deposit_required?: boolean | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          location_address?: string | null
          location_notes?: string | null
          location_type?: string | null
          practitioner_id: string
          price_cents: number
          title: string
          type: Database["public"]["Enums"]["offering_type"]
          updated_at?: string | null
          virtual_link?: string | null
        }
        Update: {
          capacity?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          deposit_percent?: number | null
          deposit_required?: boolean | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          location_address?: string | null
          location_notes?: string | null
          location_type?: string | null
          practitioner_id?: string
          price_cents?: number
          title?: string
          type?: Database["public"]["Enums"]["offering_type"]
          updated_at?: string | null
          virtual_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offerings_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          category_id: string | null
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          profile_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          profile_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          profile_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioners: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          bio: string | null
          business_name: string
          city_id: string
          contact_email: string | null
          cover_image_url: string | null
          created_at: string | null
          id: string
          instagram_handle: string | null
          phone: string | null
          profile_id: string
          rejection_reason: string | null
          slug: string
          specialties: string[] | null
          status: Database["public"]["Enums"]["practitioner_status"] | null
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
          stripe_onboarding_complete: boolean | null
          stripe_payouts_enabled: boolean | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name: string
          city_id: string
          contact_email?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          id?: string
          instagram_handle?: string | null
          phone?: string | null
          profile_id: string
          rejection_reason?: string | null
          slug: string
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["practitioner_status"] | null
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name?: string
          city_id?: string
          contact_email?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          id?: string
          instagram_handle?: string | null
          phone?: string | null
          profile_id?: string
          rejection_reason?: string | null
          slug?: string
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["practitioner_status"] | null
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practitioners_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioners_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioners_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about: string | null
          avatar_url: string | null
          id: string
          name: string | null
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          id: string
          name?: string | null
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          number_of_days: number | null
          paid_project: boolean | null
          profile_id: string | null
          project_type: string | null
          street: string | null
          updated_at: string
          us_zip_code: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          number_of_days?: number | null
          paid_project?: boolean | null
          profile_id?: string | null
          project_type?: string | null
          street?: string | null
          updated_at?: string
          us_zip_code?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          number_of_days?: number | null
          paid_project?: boolean | null
          profile_id?: string | null
          project_type?: string | null
          street?: string | null
          updated_at?: string
          us_zip_code?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_id: string | null
          referrer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_cents: number
          booking_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          status: string
          stripe_object_id: string | null
          stripe_object_type: string | null
          type: string
        }
        Insert: {
          amount_cents: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          status: string
          stripe_object_id?: string | null
          stripe_object_type?: string | null
          type: string
        }
        Update: {
          amount_cents?: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          stripe_object_id?: string | null
          stripe_object_type?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          arr: number | null
          created_at: string
          id: string
          mrr: number | null
          profile_id: string | null
          updated_at: string
          weekly_post_views: number | null
        }
        Insert: {
          arr?: number | null
          created_at?: string
          id?: string
          mrr?: number | null
          profile_id?: string | null
          updated_at?: string
          weekly_post_views?: number | null
        }
        Update: {
          arr?: number | null
          created_at?: string
          id?: string
          mrr?: number | null
          profile_id?: string | null
          updated_at?: string
          weekly_post_views?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_confirmation_code: { Args: never; Returns: string }
      get_practitioner_by_profile: {
        Args: { user_id: string }
        Returns: string
      }
      is_city_admin: {
        Args: { check_city_id: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "refunded"
        | "completed"
        | "no_show"
      offering_type: "session" | "event"
      practitioner_status: "pending" | "approved" | "suspended" | "rejected"
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
  public: {
    Enums: {
      booking_status: [
        "pending",
        "confirmed",
        "cancelled",
        "refunded",
        "completed",
        "no_show",
      ],
      offering_type: ["session", "event"],
      practitioner_status: ["pending", "approved", "suspended", "rejected"],
    },
  },
} as const
