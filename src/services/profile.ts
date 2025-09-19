// Profile API service for SmartBank application
// This service handles all profile-related operations with Supabase

import { supabase } from "@/supabase"
import type {
  Profile,
  ProfileInsert,
  ProfileUpdate,
  ApiResponse,
  SmartBankError,
} from "@/types/database"

export class ProfileService {
  /**
   * Get the current user's profile
   */
  static async getUserProfile(): Promise<ApiResponse<Profile>> {
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
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error fetching user profile:", error)
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
      console.error("Unexpected error in getUserProfile:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }

  /**
   * Create a new profile for the current user
   */
  static async createProfile(
    profileData: Omit<ProfileInsert, "id">,
  ): Promise<ApiResponse<Profile>> {
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
        .from("profiles")
        .insert({
          ...profileData,
          id: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating profile:", error)
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
      console.error("Unexpected error in createProfile:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }

  /**
   * Update the current user's profile
   */
  static async updateProfile(
    updates: ProfileUpdate,
  ): Promise<ApiResponse<Profile>> {
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
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating profile:", error)
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
      console.error("Unexpected error in updateProfile:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }

  /**
   * Get user's email from auth (since it's not in profiles table)
   */
  static async getUserEmail(): Promise<ApiResponse<string>> {
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

      return {
        data: user.email || "",
        error: null,
        loading: false,
      }
    } catch (error) {
      console.error("Unexpected error in getUserEmail:", error)
      return {
        data: null,
        error: "An unexpected error occurred",
        loading: false,
      }
    }
  }
}
