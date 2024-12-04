export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company: string | null
          subscription_tier: 'free' | 'basic' | 'premium' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company?: string | null
          subscription_tier?: 'free' | 'basic' | 'premium' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company?: string | null
          subscription_tier?: 'free' | 'basic' | 'premium' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
      }
      website_analyses: {
        Row: {
          id: string
          user_id: string
          url: string
          metrics: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          metrics: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          metrics?: Json
          created_at?: string
        }
      }
      social_analyses: {
        Row: {
          id: string
          user_id: string
          brand: string
          data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brand: string
          data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand?: string
          data?: Json
          created_at?: string
        }
      }
      news_analyses: {
        Row: {
          id: string
          user_id: string
          query: string
          data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query: string
          data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          query?: string
          data?: Json
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          name: string
          data: Json
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          name: string
          data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          data?: Json
          created_at?: string
        }
      }
      crm_integrations: {
        Row: {
          id: string
          user_id: string
          provider: 'salesforce' | 'hubspot'
          config: Json
          last_sync: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'salesforce' | 'hubspot'
          config: Json
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: 'salesforce' | 'hubspot'
          config?: Json
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'analysis_complete' | 'report_ready' | 'subscription_expiring' | 'usage_limit' | 'system_alert'
          title: string
          message: string
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'analysis_complete' | 'report_ready' | 'subscription_expiring' | 'usage_limit' | 'system_alert'
          title: string
          message: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'analysis_complete' | 'report_ready' | 'subscription_expiring' | 'usage_limit' | 'system_alert'
          title?: string
          message?: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}