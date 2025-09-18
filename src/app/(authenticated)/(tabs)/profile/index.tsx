import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { Alert, Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { supabase } from "@/supabase"
import { getUserProfile } from "@/data/mockData"

export default function ProfileScreen() {
  const userProfile = getUserProfile()

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

  return (
    <View className="flex-1 bg-neutral-50">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View className="mt-4 items-center">
            <LinearGradient
              colors={["#2791B5", "#2B6173"]}
              className="h-24 w-24 items-center justify-center rounded-full"
            >
              <Ionicons name="person" size={40} color="white" />
            </LinearGradient>
            <Text className="mt-3 text-[24px] font-bold text-[#0C212C]">
              {userProfile.firstName} {userProfile.lastName}
            </Text>
            <Text className="text-[14px] font-medium text-neutral-600">
              {userProfile.email}
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
            
            <ProfileInfoItem label="First Name" value={userProfile.firstName} />
            <ProfileInfoItem label="Last Name" value={userProfile.lastName} />
            <ProfileInfoItem label="Email" value={userProfile.email} />
            <ProfileInfoItem label="Phone Number" value={userProfile.phoneNumber} />
            <ProfileInfoItem label="Date of Birth" value={userProfile.dateOfBirth} />
            <ProfileInfoItem label="Gender" value={userProfile.gender} />
          </View>

          {/* Address Information */}
          <View className="mt-6">
            <Text className="mb-3 text-[20px] font-bold text-[#0C212C]">
              Address Information
            </Text>
            
            <ProfileInfoItem label="Address" value={userProfile.address} />
            <ProfileInfoItem label="City" value={userProfile.city} />
            <ProfileInfoItem label="State" value={userProfile.state} />
            <ProfileInfoItem label="ZIP Code" value={userProfile.zipCode} />
            <ProfileInfoItem label="Country" value={userProfile.country} />
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
