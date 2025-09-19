// Custom hook for managing accounts with real-time updates
// This hook provides a React-friendly interface to the AccountsService

import { useState, useEffect, useCallback } from "react"
import { AccountsService } from "@/services/accounts"
import type { Account, ApiResponse } from "@/types/database"

export interface UseAccountsReturn {
  accounts: Account[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getAccountsByType: (
    type: "Personal" | "Business" | "Savings" | "Checking" | "Investment",
  ) => Account[]
  getTotalBalance: () => number
  isConnected: boolean
}

export function useAccounts(): UseAccountsReturn {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await AccountsService.getUserAccounts()

      if (response.error) {
        console.log("❌ Error fetching accounts:", response.error)
        setError(response.error)
        setAccounts([])
        setIsConnected(false)
      } else {
        console.log("✅ Accounts fetched successfully:", response.data)
        setAccounts(response.data || [])
        setIsConnected(true)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      setAccounts([])
      setIsConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const getAccountsByType = useCallback(
    (type: "Personal" | "Business" | "Savings" | "Checking" | "Investment") => {
      return accounts.filter((account) => account.type === type)
    },
    [accounts],
  )

  const getTotalBalance = useCallback(() => {
    return accounts.reduce(
      (total, account) => total + Number(account.balance),
      0,
    )
  }, [accounts])

  // Initial fetch
  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  // Set up real-time subscription
  useEffect(() => {
    const subscription = AccountsService.subscribeToAccountUpdates(
      (payload) => {
        console.log("📡 Account update received:", payload)

        // Refetch accounts when changes occur
        fetchAccounts()
      },
      (error) => {
        console.error("❌ Real-time subscription error:", error)
        setError("Real-time updates unavailable")
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchAccounts])

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
    getAccountsByType,
    getTotalBalance,
    isConnected,
  }
}

// Hook for getting accounts by specific type
export function useAccountsByType(
  type: "Personal" | "Business" | "Savings" | "Checking" | "Investment",
) {
  const { accounts, loading, error, refetch, isConnected } = useAccounts()
  const filteredAccounts = accounts.filter((account) => account.type === type)

  return {
    accounts: filteredAccounts,
    loading,
    error,
    refetch,
    isConnected,
  }
}

// Hook for getting total balance
export function useTotalBalance() {
  const { accounts, loading, error, refetch, isConnected } = useAccounts()
  const totalBalance = accounts.reduce(
    (total, account) => total + Number(account.balance),
    0,
  )

  return {
    totalBalance,
    loading,
    error,
    refetch,
    isConnected,
  }
}
