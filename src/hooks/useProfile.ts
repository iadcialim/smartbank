// Custom hook for managing user profile with real-time updates
// This hook provides a React-friendly interface to the ProfileService

import { useState, useEffect, useCallback } from 'react'
import { ProfileService } from '@/services/profile'
import type { Profile, ApiResponse } from '@/types/database'

export interface UseProfileReturn {
  profile: Profile | null
  email: string | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>
  isConnected: boolean
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch profile and email in parallel
      const [profileResponse, emailResponse] = await Promise.all([
        ProfileService.getUserProfile(),
        ProfileService.getUserEmail()
      ])
      
      if (profileResponse.error) {
        setError(profileResponse.error)
        setProfile(null)
        setIsConnected(false)
      } else {
        setProfile(profileResponse.data)
        setIsConnected(true)
      }

      if (emailResponse.error) {
        console.error('Error fetching email:', emailResponse.error)
        setEmail(null)
      } else {
        setEmail(emailResponse.data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setProfile(null)
      setEmail(null)
      setIsConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (updates: Partial<Profile>): Promise<boolean> => {
    try {
      setError(null)
      
      const response = await ProfileService.updateProfile(updates)
      
      if (response.error) {
        setError(response.error)
        return false
      }

      setProfile(response.data)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return false
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    email,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    isConnected
  }
}
