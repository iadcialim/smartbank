// Transactions API service for SmartBank application
// This service handles all transaction-related operations with Supabase

import { supabase } from "@/supabase"
import type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
  ApiResponse,
  PaginatedResponse,
  SmartBankError,
} from "@/types/database"

export class TransactionsService {
  /**
   * Get transactions for a specific account with pagination
   */
  static async getAccountTransactions(
    accountId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<PaginatedResponse<Transaction>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: [],
          error: "User not authenticated",
          loading: false,
          hasMore: false,
          totalCount: 0,
        }
      }

      // First, verify the account belongs to the user
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("id")
        .eq("id", accountId)
        .eq("user_id", user.id)
        .single()

      if (accountError || !account) {
        return {
          data: [],
          error: "Account not found or access denied",
          loading: false,
          hasMore: false,
          totalCount: 0,
        }
      }

      // Get total count
      const { count, error: countError } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("account_id", accountId)

      if (countError) {
        console.error("Error getting transaction count:", countError)
        return {
          data: [],
          error: countError.message,
          loading: false,
          hasMore: false,
          totalCount: 0,
        }
      }

      // Get paginated transactions
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", accountId)
        .order("date", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error("Error fetching account transactions:", error)
        return {
          data: [],
          error: error.message,
          loading: false,
          hasMore: false,
          totalCount: count || 0,
        }
      }

      const hasMore = offset + limit < (count || 0)

      return {
        data: data || [],
        error: null,
        loading: false,
        hasMore,
        totalCount: count || 0,
      }
    } catch (error) {
      console.error("Unexpected error in getAccountTransactions:", error)
      return {
        data: [],
        error: "An unexpected error occurred",
        loading: false,
        hasMore: false,
        totalCount: 0,
      }
    }
  }

  /**
   * Get recent transactions across all user accounts
   */
  static async getRecentTransactions(
    limit: number = 10,
  ): Promise<ApiResponse<Transaction[]>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: "User not authenticated",
          loading: false,
        }
      }

      // Get user's account IDs
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)

      if (accountsError || !accounts || accounts.length === 0) {
        return {
          data: [],
          error: null,
          loading: false,
        }
      }

      const accountIds = accounts.map((account) => account.id)

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .in("account_id", accountIds)
        .order("date", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching recent transactions:", error)
        return {
          data: null,
          error: error.message,
          loading: false,
        }
      }

      return {
        data: data || [],
        error: null,
        loading: false,
      }
    } catch (error) {
      console.error("Unexpected error in getRecentTransactions:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }

  /**
   * Get transactions by type across all user accounts
   */
  static async getTransactionsByType(
    type: "sent" | "received" | "bill" | "transfer" | "deposit" | "withdrawal",
    limit: number = 50,
  ): Promise<ApiResponse<Transaction[]>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: "User not authenticated",
          loading: false,
        }
      }

      // Get user's account IDs
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)

      if (accountsError || !accounts || accounts.length === 0) {
        return {
          data: [],
          error: null,
          loading: false,
        }
      }

      const accountIds = accounts.map((account) => account.id)

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .in("account_id", accountIds)
        .eq("type", type)
        .order("date", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching transactions by type:", error)
        return {
          data: null,
          error: error.message,
          loading: false,
        }
      }

      return {
        data: data || [],
        error: null,
        loading: false,
      }
    } catch (error) {
      console.error("Unexpected error in getTransactionsByType:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }

  /**
   * Create a new transaction
   */
  static async createTransaction(
    transactionData: TransactionInsert,
  ): Promise<ApiResponse<Transaction>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: "User not authenticated",
          loading: false,
        }
      }

      // Verify the account belongs to the user
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("id")
        .eq("id", transactionData.account_id)
        .eq("user_id", user.id)
        .single()

      if (accountError || !account) {
        return {
          data: null,
          error: "Account not found or access denied",
          loading: false,
        }
      }

      const { data, error } = await supabase
        .from("transactions")
        .insert(transactionData)
        .select()
        .single()

      if (error) {
        console.error("Error creating transaction:", error)
        return {
          data: null,
          error: error.message,
          loading: false,
        }
      }

      return {
        data,
        error: null,
        loading: false,
      }
    } catch (error) {
      console.error("Unexpected error in createTransaction:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(
    transactionId: string,
    status: "completed" | "pending" | "failed" | "cancelled",
  ): Promise<ApiResponse<Transaction>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: "User not authenticated",
          loading: false,
        }
      }

      // Verify the transaction belongs to the user
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .select(
          `
          id,
          account_id,
          accounts!inner(user_id)
        `,
        )
        .eq("id", transactionId)
        .eq("accounts.user_id", user.id)
        .single()

      if (transactionError || !transaction) {
        return {
          data: null,
          error: "Transaction not found or access denied",
          loading: false,
        }
      }

      const { data, error } = await supabase
        .from("transactions")
        .update({ status })
        .eq("id", transactionId)
        .select()
        .single()

      if (error) {
        console.error("Error updating transaction status:", error)
        return {
          data: null,
          error: error.message,
          loading: false,
        }
      }

      return {
        data,
        error: null,
        loading: false,
      }
    } catch (error) {
      console.error("Unexpected error in updateTransactionStatus:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }

  /**
   * Subscribe to real-time transaction updates for user's accounts
   */
  static subscribeToTransactionUpdates(
    onUpdate: (payload: any) => void,
    onError?: (error: any) => void,
  ) {
    return supabase
      .channel("transactions_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
        },
        (payload) => {
          // Verify the transaction belongs to the current user
          if (payload.new && payload.new.account_id) {
            supabase.auth.getUser().then(({ data: { user } }) => {
              if (user) {
                // Check if the account belongs to the user
                supabase
                  .from("accounts")
                  .select("id")
                  .eq("id", payload.new.account_id)
                  .eq("user_id", user.id)
                  .single()
                  .then(({ data: account }) => {
                    if (account) {
                      onUpdate(payload)
                    }
                  })
              }
            })
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Subscribed to transaction updates")
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Error subscribing to transaction updates")
          onError?.(new Error("Failed to subscribe to transaction updates"))
        }
      })
  }

  /**
   * Get transaction statistics for a user
   */
  static async getTransactionStats(): Promise<
    ApiResponse<{
      totalTransactions: number
      totalSent: number
      totalReceived: number
      totalBills: number
      averageTransactionAmount: number
    }>
  > {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          data: null,
          error: "User not authenticated",
          loading: false,
        }
      }

      // Get user's account IDs
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)

      if (accountsError || !accounts || accounts.length === 0) {
        return {
          data: {
            totalTransactions: 0,
            totalSent: 0,
            totalReceived: 0,
            totalBills: 0,
            averageTransactionAmount: 0,
          },
          error: null,
          loading: false,
        }
      }

      const accountIds = accounts.map((account) => account.id)

      const { data, error } = await supabase
        .from("transactions")
        .select("type, amount")
        .in("account_id", accountIds)

      if (error) {
        console.error("Error fetching transaction stats:", error)
        return {
          data: null,
          error: error.message,
          loading: false,
        }
      }

      const transactions = data || []
      const totalTransactions = transactions.length
      const totalSent = transactions
        .filter((t) => t.type === "sent")
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const totalReceived = transactions
        .filter((t) => t.type === "received")
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const totalBills = transactions
        .filter((t) => t.type === "bill")
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const averageTransactionAmount =
        totalTransactions > 0
          ? transactions.reduce((sum, t) => sum + Number(t.amount), 0) /
            totalTransactions
          : 0

      return {
        data: {
          totalTransactions,
          totalSent,
          totalReceived,
          totalBills,
          averageTransactionAmount,
        },
        error: null,
        loading: false,
      }
    } catch (error) {
      console.error("Unexpected error in getTransactionStats:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }
}
