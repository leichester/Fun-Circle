import { createClient } from '@supabase/supabase-js'

// These will be your Supabase project URL and anon key
// You'll get these when you create your Supabase project
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'your-project-url'
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          user_id: string
          type: 'offer' | 'need'
          title: string
          description: string
          date_time: string | null
          price: string | null
          online: boolean
          location: string | null
          city: string | null
          state: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'offer' | 'need'
          title: string
          description: string
          date_time?: string | null
          price?: string | null
          online?: boolean
          location?: string | null
          city?: string | null
          state?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'offer' | 'need'
          title?: string
          description?: string
          date_time?: string | null
          price?: string | null
          online?: boolean
          location?: string | null
          city?: string | null
          state?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
