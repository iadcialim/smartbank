import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { getPersonalAccounts, getBusinessAccounts, type Account } from "@/data/mockData"

export default function AccountsScreen() {
  const personalAccounts = getPersonalAccounts()
  const businessAccounts = getBusinessAccounts()

  return (
    <View className="flex-1 bg-neutral-50">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Personal Accounts Section */}
          <View className="mt-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[20px] font-bold text-[#0C212C]">
                Personal Accounts
              </Text>
              <Pressable className="flex-row items-center">
                <Ionicons name="add-circle" size={20} color="#2791B5" />
                <Text className="ml-1 text-[14px] font-semibold text-[#2791B5]">
                  Add Account
                </Text>
              </Pressable>
            </View>
            
            {personalAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </View>

          {/* Business Accounts Section */}
          <View className="mt-6">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[20px] font-bold text-[#0C212C]">
                Business Accounts
              </Text>
              <Pressable className="flex-row items-center">
                <Ionicons name="add-circle" size={20} color="#2791B5" />
                <Text className="ml-1 text-[14px] font-semibold text-[#2791B5]">
                  Add Account
                </Text>
              </Pressable>
            </View>
            
            {businessAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </View>

          {/* Quick Actions */}
          <View className="mt-6 mb-8">
            <Text className="mb-3 text-[20px] font-bold text-[#0C212C]">
              Quick Actions
            </Text>
            <View className="flex-row justify-between">
              <QuickActionButton
                icon="swap-horizontal"
                title="Transfer"
                onPress={() => {}}
              />
              <QuickActionButton
                icon="card"
                title="Cards"
                onPress={() => {}}
              />
              <QuickActionButton
                icon="analytics"
                title="Analytics"
                onPress={() => {}}
              />
              <QuickActionButton
                icon="settings"
                title="Settings"
                onPress={() => {}}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}


function AccountCard({ account }: { account: Account }) {
  return (
    <Pressable
      className="mb-3 h-24 w-full flex-row items-center rounded-lg border-[1px] border-[#EAEAEA] bg-white px-4"
      style={{
        shadowColor: "rgb(168, 175, 182)",
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
      }}
      onPress={() => {}}
    >
      <LinearGradient
        colors={["#2791B5", "#2B6173"]}
        className="h-12 w-12 items-center justify-center rounded-full"
      >
        <Ionicons name="wallet" size={24} color="white" />
      </LinearGradient>
      
      <View className="ml-4 flex-1">
        <Text className="text-[16px] font-semibold text-[#0C212C]">
          {account.bankName}
        </Text>
        <Text className="text-[13px] font-medium text-neutral-600">
          {account.accountNumber}
        </Text>
      </View>
      
      <View className="items-end">
        <Text className="text-[18px] font-bold text-[#0C212C]">
          {account.balance}
        </Text>
        <Text className="text-[12px] font-medium text-neutral-600">
          {account.currency}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#94A5AB" />
    </Pressable>
  )
}

function QuickActionButton({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  onPress: () => void
}) {
  return (
    <Pressable
      className="h-16 w-16 items-center justify-center rounded-lg bg-white"
      style={{
        shadowColor: "rgb(168, 175, 182)",
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
      }}
      onPress={onPress}
    >
      <Ionicons name={icon} size={24} color="#2791B5" />
      <Text className="mt-1 text-[11px] font-medium text-neutral-600">
        {title}
      </Text>
    </Pressable>
  )
}
