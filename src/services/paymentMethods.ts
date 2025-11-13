// Payment Methods API service for SmartBank application
// This service handles all payment method-related operations with Supabase

import { supabase } from "@/supabase"
import type {
  PaymentMethod,
  PaymentMethodInsert,
  PaymentMethodUpdate,
  ApiResponse,
  SmartBankError,
} from "@/types/database"

export class PaymentMethodsService {
  /**
   * Get all payment methods for the current authenticated user
   */
  static async getUserPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
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

      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching user payment methods:", error)
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
      console.error("Unexpected error in getUserPaymentMethods:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }

  /**
   * Get payment methods by type for the current authenticated user
   */
  static async getUserPaymentMethodsByType(
    type: "card" | "bank",
  ): Promise<ApiResponse<PaymentMethod[]>> {
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

      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", type)
        .eq("is_active", true)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching payment methods by type:", error)
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
      console.error("Unexpected error in getUserPaymentMethodsByType:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }

  /**
   * Get the default payment method for the current authenticated user
   */
  static async getDefaultPaymentMethod(): Promise<
    ApiResponse<PaymentMethod | null>
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

      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .eq("is_active", true)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found"
        console.error("Error fetching default payment method:", error)
        return {
          data: null,
          error: error.message,
          loading: false,
        }
      }

      return {
        data: data || null,
        error: null,
        loading: false,
      }
    } catch (error) {
      console.error("Unexpected error in getDefaultPaymentMethod:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }

  /**
   * Get a specific payment method by ID
   */
  static async getPaymentMethodById(
    paymentMethodId: string,
  ): Promise<ApiResponse<PaymentMethod>> {
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

      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("id", paymentMethodId)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single()

      if (error) {
        console.error("Error fetching payment method by ID:", error)
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
      console.error("Unexpected error in getPaymentMethodById:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }

  /**
   * Create a new payment method
   */
  static async createPaymentMethod(
    paymentMethodData: Omit<PaymentMethodInsert, "user_id">,
  ): Promise<ApiResponse<PaymentMethod>> {
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

      // If this is set as default, unset other default payment methods
      if (paymentMethodData.is_default) {
        await supabase
          .from("payment_methods")
          .update({ is_default: false })
          .eq("user_id", user.id)
          .eq("is_active", true)
      }

      const { data, error } = await supabase
        .from("payment_methods")
        .insert({
          ...paymentMethodData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating payment method:", error)
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
      console.error("Unexpected error in createPaymentMethod:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }

  /**
   * Update an existing payment method
   */
  static async updatePaymentMethod(
    paymentMethodId: string,
    updates: PaymentMethodUpdate,
  ): Promise<ApiResponse<PaymentMethod>> {
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

      // If this is being set as default, unset other default payment methods
      if (updates.is_default === true) {
        await supabase
          .from("payment_methods")
          .update({ is_default: false })
          .eq("user_id", user.id)
          .eq("is_active", true)
          .neq("id", paymentMethodId)
      }

      const { data, error } = await supabase
        .from("payment_methods")
        .update(updates)
        .eq("id", paymentMethodId)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating payment method:", error)
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
      console.error("Unexpected error in updatePaymentMethod:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }

  /**
   * Set a payment method as default
   */
  static async setDefaultPaymentMethod(
    paymentMethodId: string,
  ): Promise<ApiResponse<PaymentMethod>> {
    return this.updatePaymentMethod(paymentMethodId, { is_default: true })
  }

  /**
   * Deactivate a payment method (soft delete)
   */
  static async deactivatePaymentMethod(
    paymentMethodId: string,
  ): Promise<ApiResponse<PaymentMethod>> {
    return this.updatePaymentMethod(paymentMethodId, { is_active: false })
  }

  /**
   * Subscribe to real-time payment method updates for the current user
   */
  static subscribeToPaymentMethodUpdates(
    onUpdate: (payload: any) => void,
    onError?: (error: any) => void,
  ) {
    return supabase
      .channel("payment_methods_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payment_methods",
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
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Subscribed to payment method updates")
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Error subscribing to payment method updates")
          onError?.(new Error("Failed to subscribe to payment method updates"))
        }
      })
  }

  /**
   * Get payment method statistics for a user
   */
  static async getPaymentMethodStats(): Promise<
    ApiResponse<{
      totalPaymentMethods: number
      totalCards: number
      totalBankAccounts: number
      hasDefaultMethod: boolean
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

      const { data, error } = await supabase
        .from("payment_methods")
        .select("type, is_default")
        .eq("user_id", user.id)
        .eq("is_active", true)

      if (error) {
        console.error("Error fetching payment method stats:", error)
        return {
          data: null,
          error: error.message,
          loading: false,
        }
      }

      const paymentMethods = data || []
      const totalPaymentMethods = paymentMethods.length
      const totalCards = paymentMethods.filter(
        (pm) => pm.type === "card",
      ).length
      const totalBankAccounts = paymentMethods.filter(
        (pm) => pm.type === "bank",
      ).length
      const hasDefaultMethod = paymentMethods.some((pm) => pm.is_default)

      return {
        data: {
          totalPaymentMethods,
          totalCards,
          totalBankAccounts,
          hasDefaultMethod,
        },
        error: null,
        loading: false,
      }
    } catch (error) {
      console.error("Unexpected error in getPaymentMethodStats:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }
}
