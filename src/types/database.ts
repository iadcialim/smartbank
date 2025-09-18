// Database types for SmartBank application
// These types match the Supabase database schema

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          phone_number: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string | null
          date_of_birth: string | null
          gender: string | null
          profile_picture: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          date_of_birth?: string | null
          gender?: string | null
          profile_picture?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          date_of_birth?: string | null
          gender?: string | null
          profile_picture?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          type: 'Personal' | 'Business' | 'Savings' | 'Checking' | 'Investment'
          account_number: string
          balance: number
          currency: string
          bank_name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'Personal' | 'Business' | 'Savings' | 'Checking' | 'Investment'
          account_number: string
          balance?: number
          currency?: string
          bank_name: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'Personal' | 'Business' | 'Savings' | 'Checking' | 'Investment'
          account_number?: string
          balance?: number
          currency?: string
          bank_name?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          account_id: string
          transaction_id: string | null
          type: 'sent' | 'received' | 'bill' | 'transfer' | 'deposit' | 'withdrawal'
          recipient: string | null
          amount: number
          fee: number
          category: string | null
          description: string | null
          date: string
          status: 'completed' | 'pending' | 'failed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          account_id: string
          transaction_id?: string | null
          type: 'sent' | 'received' | 'bill' | 'transfer' | 'deposit' | 'withdrawal'
          recipient?: string | null
          amount: number
          fee?: number
          category?: string | null
          description?: string | null
          date: string
          status?: 'completed' | 'pending' | 'failed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          transaction_id?: string | null
          type?: 'sent' | 'received' | 'bill' | 'transfer' | 'deposit' | 'withdrawal'
          recipient?: string | null
          amount?: number
          fee?: number
          category?: string | null
          description?: string | null
          date?: string
          status?: 'completed' | 'pending' | 'failed' | 'cancelled'
          created_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          type: 'card' | 'bank'
          last_four: string
          bank_name: string
          is_default: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'card' | 'bank'
          last_four: string
          bank_name: string
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'card' | 'bank'
          last_four?: string
          bank_name?: string
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      get_user_accounts: {
        Args: {
          user_uuid: string
        }
        Returns: {
          id: string
          type: string
          account_number: string
          balance: number
          currency: string
          bank_name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_account_transactions: {
        Args: {
          account_uuid: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          transaction_id: string | null
          type: string
          recipient: string | null
          amount: number
          fee: number
          category: string | null
          description: string | null
          date: string
          status: string
          created_at: string
        }[]
      }
      get_user_payment_methods: {
        Args: {
          user_uuid: string
        }
        Returns: {
          id: string
          type: string
          last_four: string
          bank_name: string
          is_default: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }[]
      }
    }
  }
}

// Convenience types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Account = Database['public']['Tables']['accounts']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row']

export type AccountInsert = Database['public']['Tables']['accounts']['Insert']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type PaymentMethodInsert = Database['public']['Tables']['payment_methods']['Insert']

export type AccountUpdate = Database['public']['Tables']['accounts']['Update']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']
export type PaymentMethodUpdate = Database['public']['Tables']['payment_methods']['Update']

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  error: string | null
  loading: boolean
  hasMore: boolean
  totalCount: number
}

// Real-time subscription types
export interface RealtimeSubscription {
  unsubscribe: () => void
}

// Error types
export interface SmartBankError {
  message: string
  code?: string
  details?: any
}

// Account types enum for type safety
export const ACCOUNT_TYPES = {
  PERSONAL: 'Personal',
  BUSINESS: 'Business',
  SAVINGS: 'Savings',
  CHECKING: 'Checking',
  INVESTMENT: 'Investment',
} as const

export type AccountType = typeof ACCOUNT_TYPES[keyof typeof ACCOUNT_TYPES]

// Transaction types enum for type safety
export const TRANSACTION_TYPES = {
  SENT: 'sent',
  RECEIVED: 'received',
  BILL: 'bill',
  TRANSFER: 'transfer',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
} as const

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES]

// Transaction status enum for type safety
export const TRANSACTION_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const

export type TransactionStatus = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS]

// Payment method types enum for type safety
export const PAYMENT_METHOD_TYPES = {
  CARD: 'card',
  BANK: 'bank',
} as const

export type PaymentMethodType = typeof PAYMENT_METHOD_TYPES[keyof typeof PAYMENT_METHOD_TYPES]
