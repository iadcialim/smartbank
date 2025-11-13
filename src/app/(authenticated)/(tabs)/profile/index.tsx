import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { Alert, Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { supabase } from "@/supabase"
import { useProfile } from "@/hooks/useProfile"

export default function ProfileScreen() {
  const { profile, email, loading, error, refetch, isConnected } = useProfile()

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut()
          router.replace("/welcome")
        },
      },
    ])
  }

  // Show loading state
  if (loading && !profile) {
    return (
      <View className="flex-1 bg-neutral-50">
        <SafeAreaView style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2791B5" />
            <Text className="mt-4 text-[16px] text-neutral-600">
              Loading your profile...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  // Show error state
  if (error && !profile) {
    return (
      <View className="flex-1 bg-neutral-50">
        <SafeAreaView style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center px-4">
            <Ionicons name="alert-circle" size={64} color="#EF4444" />
            <Text className="mt-4 text-[18px] font-semibold text-[#0C212C]">
              Error Loading Profile
            </Text>
            <Text className="mt-2 text-center text-[14px] text-neutral-600">
              {error}
            </Text>
            <Pressable 
              className="mt-4 rounded-lg bg-[#2791B5] px-6 py-3"
              onPress={refetch}
            >
              <Text className="text-[16px] font-semibold text-white">
                Try Again
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Connection Status */}
          {!isConnected && (
            <View className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <View className="flex-row items-center">
                <Ionicons name="warning" size={20} color="#D97706" />
                <Text className="ml-2 text-[14px] text-yellow-800">
                  Offline mode - Some features may be limited
                </Text>
              </View>
            </View>
          )}

          {/* Profile Header */}
          <View className="mt-4 items-center">
            <LinearGradient
              colors={["#2791B5", "#2B6173"]}
              className="h-24 w-24 items-center justify-center rounded-full"
            >
              <Ionicons name="person" size={40} color="white" />
            </LinearGradient>
            <Text className="mt-3 text-[24px] font-bold text-[#0C212C]">
              {profile?.first_name || 'User'} {profile?.last_name || ''}
            </Text>
            <Text className="text-[14px] font-medium text-neutral-600">
              {email || 'No email available'}
            </Text>
            <Pressable className="mt-2">
              <Text className="text-[14px] font-semibold text-[#2791B5]">
                Edit Profile Picture
              </Text>
            </Pressable>
          </View>

          {/* Personal Information */}
          <View className="mt-6">
            <Text className="mb-3 text-[20px] font-bold text-[#0C212C]">
              Personal Information
            </Text>
            
            <ProfileInfoItem label="First Name" value={profile?.first_name || 'Not provided'} />
            <ProfileInfoItem label="Last Name" value={profile?.last_name || 'Not provided'} />
            <ProfileInfoItem label="Email" value={email || 'Not provided'} />
            <ProfileInfoItem label="Phone Number" value={profile?.phone_number || 'Not provided'} />
            <ProfileInfoItem label="Date of Birth" value={profile?.date_of_birth || 'Not provided'} />
            <ProfileInfoItem label="Gender" value={profile?.gender || 'Not provided'} />
          </View>

          {/* Address Information */}
          <View className="mt-6">
            <Text className="mb-3 text-[20px] font-bold text-[#0C212C]">
              Address Information
            </Text>
            
            <ProfileInfoItem label="Address" value={profile?.address || 'Not provided'} />
            <ProfileInfoItem label="City" value={profile?.city || 'Not provided'} />
            <ProfileInfoItem label="State" value={profile?.state || 'Not provided'} />
            <ProfileInfoItem label="ZIP Code" value={profile?.zip_code || 'Not provided'} />
            <ProfileInfoItem label="Country" value={profile?.country || 'Not provided'} />
          </View>

          {/* Settings & Actions */}
          <View className="mt-6 mb-8">
            <Text className="mb-3 text-[20px] font-bold text-[#0C212C]">
              Settings & Actions
            </Text>
            
            <ProfileActionButton
              icon="settings"
              title="Account Settings"
              subtitle="Manage your account preferences"
              onPress={() => {}}
            />
            <ProfileActionButton
              icon="shield-checkmark"
              title="Security"
              subtitle="Password, 2FA, and security settings"
              onPress={() => {}}
            />
            <ProfileActionButton
              icon="notifications"
              title="Notifications"
              subtitle="Manage notification preferences"
              onPress={() => {}}
            />
            <ProfileActionButton
              icon="help-circle"
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={() => {}}
            />
            <ProfileActionButton
              icon="document-text"
              title="Terms & Privacy"
              subtitle="View terms of service and privacy policy"
              onPress={() => {}}
            />
            
            {/* Logout Button */}
            <Pressable
              className="mt-4 h-14 w-full flex-row items-center justify-center rounded-lg border-[1px] border-red-200 bg-red-50"
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={20} color="#EF4444" />
              <Text className="ml-2 text-[16px] font-semibold text-red-600">
                Log Out
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

function ProfileInfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-3 h-14 w-full flex-row items-center rounded-lg border-[1px] border-[#EAEAEA] bg-white px-4">
      <View className="flex-1">
        <Text className="text-[12px] font-medium text-neutral-600">
          {label}
        </Text>
        <Text className="text-[14px] font-semibold text-[#0C212C]">
          {value}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#94A5AB" />
    </View>
  )
}

function ProfileActionButton({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle: string
  onPress: () => void
}) {
  return (
    <Pressable
      className="mb-3 h-16 w-full flex-row items-center rounded-lg border-[1px] border-[#EAEAEA] bg-white px-4"
      style={{
        shadowColor: "rgb(168, 175, 182)",
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
      }}
      onPress={onPress}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-100">
        <Ionicons name={icon} size={20} color="#2791B5" />
      </View>
      
      <View className="ml-3 flex-1">
        <Text className="text-[14px] font-semibold text-[#0C212C]">
          {title}
        </Text>
        <Text className="text-[12px] font-medium text-neutral-600">
          {subtitle}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={16} color="#94A5AB" />
    </Pressable>
  )
}
