export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      exploration_media: {
        Row: {
          caption: string | null
          created_at: string
          exploration_id: string
          id: string
          media_id: string
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          exploration_id: string
          id?: string
          media_id: string
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          exploration_id?: string
          id?: string
          media_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "exploration_media_exploration_id_fkey"
            columns: ["exploration_id"]
            isOneToOne: false
            referencedRelation: "explorations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exploration_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      explorations: {
        Row: {
          category: string
          cover_media_id: string | null
          created_at: string
          description: string | null
          id: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          category: string
          cover_media_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          category?: string
          cover_media_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "explorations_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          admin_notes: string | null
          area_sqm: number | null
          budget_range: string | null
          desired_timeline: string
          email: string
          id: string
          name: string
          phone: string | null
          project_brief: string
          project_location: string
          project_status: string
          project_type: string
          referral_source: string | null
          required_service: string
          status: Database["public"]["Enums"]["inquiry_status"]
          submitted_at: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          area_sqm?: number | null
          budget_range?: string | null
          desired_timeline: string
          email: string
          id?: string
          name: string
          phone?: string | null
          project_brief: string
          project_location: string
          project_status: string
          project_type: string
          referral_source?: string | null
          required_service: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          area_sqm?: number | null
          budget_range?: string | null
          desired_timeline?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          project_brief?: string
          project_location?: string
          project_status?: string
          project_type?: string
          referral_source?: string | null
          required_service?: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          submitted_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string
          bucket: string
          caption: string | null
          created_at: string
          created_by: string | null
          file_size_bytes: number | null
          height: number | null
          id: string
          is_archived: boolean
          media_type: string
          mime_type: string
          photographer: string | null
          poster_path: string | null
          storage_path: string
          updated_at: string
          width: number | null
        }
        Insert: {
          alt_text: string
          bucket?: string
          caption?: string | null
          created_at?: string
          created_by?: string | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          is_archived?: boolean
          media_type: string
          mime_type: string
          photographer?: string | null
          poster_path?: string | null
          storage_path: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          alt_text?: string
          bucket?: string
          caption?: string | null
          created_at?: string
          created_by?: string | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          is_archived?: boolean
          media_type?: string
          mime_type?: string
          photographer?: string | null
          poster_path?: string | null
          storage_path?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          created_at: string
          href: string
          id: string
          is_visible: boolean
          label: string
          placement: string
          sort_order: number
          target_blank: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          href: string
          id?: string
          is_visible?: boolean
          label: string
          placement: string
          sort_order?: number
          target_blank?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          href?: string
          id?: string
          is_visible?: boolean
          label?: string
          placement?: string
          sort_order?: number
          target_blank?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_enabled: boolean
          page_id: string
          section_key: string
          section_type: string
          settings: Json
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          page_id: string
          section_key: string
          section_type: string
          settings?: Json
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          page_id?: string
          section_key?: string
          section_type?: string
          settings?: Json
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string
          id: string
          nav_label: string | null
          og_media_id: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nav_label?: string | null
          og_media_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nav_label?: string | null
          og_media_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_og_media_id_fkey"
            columns: ["og_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      process_steps: {
        Row: {
          created_at: string
          description: string
          id: string
          media_id: string | null
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          step_no: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          media_id?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          step_no: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          media_id?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          step_no?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_steps_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_sections: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_enabled: boolean
          project_id: string
          section_key: string
          section_type: string
          sort_order: number
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          project_id: string
          section_key: string
          section_type: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          project_id?: string
          section_key?: string
          section_type?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          area_sqm: number | null
          client_type: string | null
          created_at: string
          design_role: string[]
          featured: boolean
          featured_order: number
          hero_media_id: string | null
          id: string
          location: string
          og_media_id: string | null
          project_status: Database["public"]["Enums"]["project_status"]
          project_type: string
          seo_description: string | null
          seo_title: string | null
          services: string[]
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          summary: string
          title: string
          updated_at: string
          year: number
        }
        Insert: {
          area_sqm?: number | null
          client_type?: string | null
          created_at?: string
          design_role?: string[]
          featured?: boolean
          featured_order?: number
          hero_media_id?: string | null
          id?: string
          location: string
          og_media_id?: string | null
          project_status: Database["public"]["Enums"]["project_status"]
          project_type: string
          seo_description?: string | null
          seo_title?: string | null
          services?: string[]
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          summary: string
          title: string
          updated_at?: string
          year: number
        }
        Update: {
          area_sqm?: number | null
          client_type?: string | null
          created_at?: string
          design_role?: string[]
          featured?: boolean
          featured_order?: number
          hero_media_id?: string | null
          id?: string
          location?: string
          og_media_id?: string | null
          project_status?: Database["public"]["Enums"]["project_status"]
          project_type?: string
          seo_description?: string | null
          seo_title?: string | null
          services?: string[]
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string
          title?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_og_media_id_fkey"
            columns: ["og_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          deliverables: string[]
          excluded: string[]
          featured: boolean
          full_description: string | null
          id: string
          ideal_client: string | null
          included: string[]
          media_id: string | null
          name: string
          scope: string[]
          short_description: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          typical_project_types: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deliverables?: string[]
          excluded?: string[]
          featured?: boolean
          full_description?: string | null
          id?: string
          ideal_client?: string | null
          included?: string[]
          media_id?: string | null
          name: string
          scope?: string[]
          short_description: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          typical_project_types?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deliverables?: string[]
          excluded?: string[]
          featured?: boolean
          full_description?: string | null
          id?: string
          ideal_client?: string | null
          included?: string[]
          media_id?: string | null
          name?: string
          scope?: string[]
          short_description?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          typical_project_types?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          default_og_media_id: string | null
          default_seo_description: string
          default_seo_title: string
          email: string | null
          footer_text: string | null
          id: number
          inquiry_config: Json
          location: string | null
          phone: string | null
          professional_role: string
          service_area: string | null
          site_name: string
          social_links: Json
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          default_og_media_id?: string | null
          default_seo_description: string
          default_seo_title: string
          email?: string | null
          footer_text?: string | null
          id: number
          inquiry_config?: Json
          location?: string | null
          phone?: string | null
          professional_role: string
          service_area?: string | null
          site_name: string
          social_links?: Json
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          default_og_media_id?: string | null
          default_seo_description?: string
          default_seo_title?: string
          email?: string | null
          footer_text?: string | null
          id?: number
          inquiry_config?: Json
          location?: string | null
          phone?: string | null
          professional_role?: string
          service_area?: string | null
          site_name?: string
          social_links?: Json
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_default_og_media_id_fkey"
            columns: ["default_og_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          client_name: string
          client_role: string | null
          created_at: string
          featured: boolean
          id: string
          project_name: string | null
          quote: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          client_name: string
          client_role?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          project_name?: string | null
          quote: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          client_name?: string
          client_role?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          project_name?: string | null
          quote?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      reorder_explorations: {
        Args: { exploration_ids: string[] }
        Returns: undefined
      }
      reorder_navigation_items: {
        Args: { item_ids: string[] }
        Returns: undefined
      }
      reorder_page_sections: {
        Args: { p_page_id: string; p_section_ids: string[] }
        Returns: undefined
      }
      reorder_process_steps: {
        Args: { process_step_ids: string[] }
        Returns: undefined
      }
      reorder_project_sections: {
        Args: { p_project_id: string; p_section_ids: string[] }
        Returns: undefined
      }
      reorder_projects: { Args: { project_ids: string[] }; Returns: undefined }
      reorder_services: { Args: { service_ids: string[] }; Returns: undefined }
      reorder_testimonials: {
        Args: { testimonial_ids: string[] }
        Returns: undefined
      }
    }
    Enums: {
      content_status: "draft" | "published" | "archived"
      inquiry_status:
        | "new"
        | "contacted"
        | "qualified"
        | "won"
        | "lost"
        | "spam"
      project_status: "concept" | "ongoing" | "completed"
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
      content_status: ["draft", "published", "archived"],
      inquiry_status: ["new", "contacted", "qualified", "won", "lost", "spam"],
      project_status: ["concept", "ongoing", "completed"],
    },
  },
} as const

