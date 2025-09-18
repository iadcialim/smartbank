// Accounts API service for SmartBank application
// This service handles all account-related operations with Supabase

import { supabase } from '@/supabase'
import type { 
  Account, 
  AccountInsert, 
  AccountUpdate, 
  ApiResponse, 
  PaginatedResponse,
  SmartBankError 
} from '@/types/database'

export class AccountsService {
  /**
   * Get all accounts for the current authenticated user
   */
  static async getUserAccounts(): Promise<ApiResponse<Account[]>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User not authenticated',
          loading: false
        }
      }

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      console.log('🔍 Supabase query result:', { data, error, userId: user.id })

      if (error) {
        console.error('Error fetching user accounts:', error)
        return {
          data: null,
          error: error.message,
          loading: false
        }
      }

      return {
        data: data || [],
        error: null,
        loading: false
      }
    } catch (error) {
      console.error('Unexpected error in getUserAccounts:', error)
      return {
        data: null,
        error: 'An unexpected error occurred',
        loading: false
      }
    }
  }

  /**
   * Get accounts by type for the current authenticated user
   */
  static async getUserAccountsByType(type: 'Personal' | 'Business' | 'Savings' | 'Checking' | 'Investment'): Promise<ApiResponse<Account[]>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User not authenticated',
          loading: false
        }
      }

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', type)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching accounts by type:', error)
        return {
          data: null,
          error: error.message,
          loading: false
        }
      }

      return {
        data: data || [],
        error: null,
        loading: false
      }
    } catch (error) {
      console.error('Unexpected error in getUserAccountsByType:', error)
      return {
        data: null,
        error: 'An unexpected error occurred',
        loading: false
      }
    }
  }

  /**
   * Get a specific account by ID
   */
  static async getAccountById(accountId: string): Promise<ApiResponse<Account>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User not authenticated',
          loading: false
        }
      }

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching account by ID:', error)
        return {
          data: null,
          error: error.message,
          loading: false
        }
      }

      return {
        data,
        error: null,
        loading: false
      }
    } catch (error) {
      console.error('Unexpected error in getAccountById:', error)
      return {
        data: null,
        error: 'An unexpected error occurred',
        loading: false
      }
    }
  }

  /**
   * Create a new account
   */
  static async createAccount(accountData: Omit<AccountInsert, 'user_id'>): Promise<ApiResponse<Account>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User not authenticated',
          loading: false
        }
      }

      const { data, error } = await supabase
        .from('accounts')
        .insert({
          ...accountData,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating account:', error)
        return {
          data: null,
          error: error.message,
          loading: false
        }
      }

      return {
        data,
        error: null,
        loading: false
      }
    } catch (error) {
      console.error('Unexpected error in createAccount:', error)
      return {
        data: null,
        error: 'An unexpected error occurred',
        loading: false
      }
    }
  }

  /**
   * Update an existing account
   */
  static async updateAccount(accountId: string, updates: AccountUpdate): Promise<ApiResponse<Account>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          data: null,
          error: 'User not authenticated',
          loading: false
        }
      }

      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', accountId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating account:', error)
        return {
          data: null,
          error: error.message,
          loading: false
        }
      }

      return {
        data,
        error: null,
        loading: false
      }
    } catch (error) {
      console.error('Unexpected error in updateAccount:', error)
      return {
        data: null,
        error: 'An unexpected error occurred',
        loading: false
      }
    }
  }

  /**
   * Update account balance
   */
  static async updateAccountBalance(accountId: string, newBalance: number): Promise<ApiResponse<Account>> {
    return this.updateAccount(accountId, { balance: newBalance })
  }

  /**
   * Deactivate an account (soft delete)
   */
  static async deactivateAccount(accountId: string): Promise<ApiResponse<Account>> {
    return this.updateAccount(accountId, { is_active: false })
  }

  /**
   * Subscribe to real-time account updates for the current user
   */
  static subscribeToAccountUpdates(
    onUpdate: (payload: any) => void,
    onError?: (error: any) => void
  ) {
    return supabase
      .channel('accounts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts'
        },
        (payload) => {
          // Only process updates for the current user
          if (payload.new && payload.new.user_id) {
            supabase.auth.getUser().then(({ data: { user } }) => {
              if (user && payload.new.user_id === user.id) {
                onUpdate(payload)
              }
            })
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to account updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to account updates')
          onError?.(new Error('Failed to subscribe to account updates'))
        }
      })
  }

  /**
   * Get total balance across all user accounts
   */
  static async getTotalBalance(): Promise<ApiResponse<number>> {
    try {
      const accountsResponse = await this.getUserAccounts()
      
      if (accountsResponse.error || !accountsResponse.data) {
        return {
          data: null,
          error: accountsResponse.error || 'Failed to fetch accounts',
          loading: false
        }
      }

      const totalBalance = accountsResponse.data.reduce((sum, account) => {
        return sum + Number(account.balance)
      }, 0)

      return {
        data: totalBalance,
        error: null,
        loading: false
      }
    } catch (error) {
      console.error('Unexpected error in getTotalBalance:', error)
      return {
        data: null,
        error: 'An unexpected error occurred',
        loading: false
      }
    }
  }

  /**
   * Get accounts grouped by type
   */
  static async getAccountsGroupedByType(): Promise<ApiResponse<Record<string, Account[]>>> {
    try {
      const accountsResponse = await this.getUserAccounts()
      
      if (accountsResponse.error || !accountsResponse.data) {
        return {
          data: null,
          error: accountsResponse.error || 'Failed to fetch accounts',
          loading: false
        }
      }

      const groupedAccounts = accountsResponse.data.reduce((groups, account) => {
        const type = account.type
        if (!groups[type]) {
          groups[type] = []
        }
        groups[type].push(account)
        return groups
      }, {} as Record<string, Account[]>)

      return {
        data: groupedAccounts,
        error: null,
        loading: false
      }
    } catch (error) {
      console.error('Unexpected error in getAccountsGroupedByType:', error)
      return {
        data: null,
        error: 'An unexpected error occurred',
        loading: false
      }
    }
  }
}
