import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Configuration Supabase avec les vraies clés
const supabaseUrl = 'https://gehvdncxbcfotnabmjmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlaHZkbmN4YmNmb3RuYWJtam1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NDk5MDIsImV4cCI6MjA2NjEyNTkwMn0.vKsn8CZws3C2l-TNwmgzOIafbrI35EQNDmFHjHdW4i8';

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types pour les tables Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          phone?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          address: string;
          city: string;
          country: string;
          postal_code: string | null;
          is_default: boolean;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          address: string;
          city: string;
          country: string;
          postal_code?: string | null;
          is_default?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          address?: string;
          city?: string;
          country?: string;
          postal_code?: string | null;
          is_default?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      stores: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category_id: string;
          image_url: string | null;
          address: string;
          city: string;
          country: string;
          phone: string | null;
          email: string | null;
          is_active: boolean;
          rating: number | null;
          delivery_fee: number;
          minimum_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category_id: string;
          image_url?: string | null;
          address: string;
          city: string;
          country: string;
          phone?: string | null;
          email?: string | null;
          is_active?: boolean;
          rating?: number | null;
          delivery_fee?: number;
          minimum_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category_id?: string;
          image_url?: string | null;
          address?: string;
          city?: string;
          country?: string;
          phone?: string | null;
          email?: string | null;
          is_active?: boolean;
          rating?: number | null;
          delivery_fee?: number;
          minimum_order?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          is_available?: boolean;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          store_id: string;
          status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
          total_amount: number;
          delivery_fee: number;
          delivery_address: string;
          delivery_instructions: string | null;
          payment_method: 'cash' | 'card' | 'mobile_money';
          payment_status: 'pending' | 'paid' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_id: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
          total_amount: number;
          delivery_fee: number;
          delivery_address: string;
          delivery_instructions?: string | null;
          payment_method: 'cash' | 'card' | 'mobile_money';
          payment_status?: 'pending' | 'paid' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          store_id?: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
          total_amount?: number;
          delivery_fee?: number;
          delivery_address?: string;
          delivery_instructions?: string | null;
          payment_method?: 'cash' | 'card' | 'mobile_money';
          payment_status?: 'pending' | 'paid' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 