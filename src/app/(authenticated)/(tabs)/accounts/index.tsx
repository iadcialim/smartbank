import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Pressable, ScrollView, Text, View, ActivityIndicator, Alert, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useAccounts } from "@/hooks/useAccounts"
import type { Account } from "@/types/database"

export default function AccountsScreen() {
  const { 
    accounts, 
    loading, 
    error, 
    refetch, 
    getAccountsByType, 
    getTotalBalance,
    isConnected 
  } = useAccounts()

  const personalAccounts = getAccountsByType('Personal')
  const businessAccounts = getAccountsByType('Business')
  const savingsAccounts = getAccountsByType('Savings')
  const checkingAccounts = getAccountsByType('Checking')
  const investmentAccounts = getAccountsByType('Investment')
  const totalBalance = getTotalBalance()

  // Debug logging (remove in production)
  console.log('🔍 Accounts Debug:', {
    totalAccounts: accounts.length,
    personalAccounts: personalAccounts.length,
    businessAccounts: businessAccounts.length,
    totalBalance,
    firstAccount: accounts[0],
    loading,
    error,
    isConnected
  })

  // Handle refresh
  const handleRefresh = async () => {
    await refetch()
  }

  // Show loading state
  if (loading && accounts.length === 0) {
    return (
      <View className="flex-1 bg-neutral-50">
        <SafeAreaView style={{ flex: 1 }}>
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2791B5" />
            <Text className="mt-4 text-[16px] text-neutral-600">
              Loading your accounts...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          className="flex-1 px-4" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor="#2791B5"
            />
          }
        >
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

          {/* Total Balance Summary */}
          <LinearGradient
            colors={["#2791B5", "#2B6173"]}
            className="mt-4 rounded-lg p-4"
          >
            <Text className="text-[14px] text-white/80">Total Balance</Text>
            <Text className="text-[28px] font-bold text-white">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </LinearGradient>
          {/* Personal Accounts Section */}
          {personalAccounts.length > 0 && (
            <View className="mt-6">
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
          )}

          {/* Business Accounts Section */}
          {businessAccounts.length > 0 && (
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
          )}

          {/* Savings Accounts Section */}
          {savingsAccounts.length > 0 && (
            <View className="mt-6">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-[20px] font-bold text-[#0C212C]">
                  Savings Accounts
                </Text>
                <Pressable className="flex-row items-center">
                  <Ionicons name="add-circle" size={20} color="#2791B5" />
                  <Text className="ml-1 text-[14px] font-semibold text-[#2791B5]">
                    Add Account
                  </Text>
                </Pressable>
              </View>
              
              {savingsAccounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </View>
          )}

          {/* Checking Accounts Section */}
          {checkingAccounts.length > 0 && (
            <View className="mt-6">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-[20px] font-bold text-[#0C212C]">
                  Checking Accounts
                </Text>
                <Pressable className="flex-row items-center">
                  <Ionicons name="add-circle" size={20} color="#2791B5" />
                  <Text className="ml-1 text-[14px] font-semibold text-[#2791B5]">
                    Add Account
                  </Text>
                </Pressable>
              </View>
              
              {checkingAccounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </View>
          )}

          {/* Investment Accounts Section */}
          {investmentAccounts.length > 0 && (
            <View className="mt-6">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-[20px] font-bold text-[#0C212C]">
                  Investment Accounts
                </Text>
                <Pressable className="flex-row items-center">
                  <Ionicons name="add-circle" size={20} color="#2791B5" />
                  <Text className="ml-1 text-[14px] font-semibold text-[#2791B5]">
                    Add Account
                  </Text>
                </Pressable>
              </View>
              
              {investmentAccounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </View>
          )}

          {/* No Accounts State */}
          {accounts.length === 0 && !loading && (
            <View className="mt-8 items-center">
              <Ionicons name="wallet-outline" size={64} color="#94A5AB" />
              <Text className="mt-4 text-[18px] font-semibold text-[#0C212C]">
                No Accounts Found
              </Text>
              <Text className="mt-2 text-center text-[14px] text-neutral-600">
                You don't have any accounts yet. Add your first account to get started.
              </Text>
              <Pressable className="mt-4 rounded-lg bg-[#2791B5] px-6 py-3">
                <Text className="text-[16px] font-semibold text-white">
                  Add Your First Account
                </Text>
              </Pressable>
            </View>
          )}

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
          {account.bank_name}
        </Text>
        <Text className="text-[13px] font-medium text-neutral-600">
          {account.account_number}
        </Text>
      </View>
      
      <View className="items-end">
        <Text className="text-[18px] font-bold text-[#0C212C]">
          ${Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
