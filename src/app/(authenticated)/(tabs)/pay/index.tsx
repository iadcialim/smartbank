import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { getRecentTransactions, getPaymentMethods, type Transaction, type PaymentMethod } from "@/data/mockData"

export default function PayScreen() {
  const recentTransactions = getRecentTransactions()
  const paymentMethods = getPaymentMethods()

  return (
    <View className="flex-1 bg-neutral-50">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Quick Payment Options */}
          <View className="mt-4">
            <Text className="mb-3 text-[20px] font-bold text-[#0C212C]">
              Quick Actions
            </Text>
            <View className="flex-row justify-between">
              <PaymentActionButton
                icon="send"
                title="Send Money"
                subtitle="Transfer funds"
                onPress={() => {}}
              />
              <PaymentActionButton
                icon="card"
                title="Pay Bills"
                subtitle="Utilities & more"
                onPress={() => {}}
              />
              <PaymentActionButton
                icon="qr-code"
                title="QR Pay"
                subtitle="Scan to pay"
                onPress={() => {}}
              />
            </View>
          </View>

          {/* Payment Methods */}
          <View className="mt-6">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[20px] font-bold text-[#0C212C]">
                Payment Methods
              </Text>
              <Pressable className="flex-row items-center">
                <Ionicons name="add-circle" size={20} color="#2791B5" />
                <Text className="ml-1 text-[14px] font-semibold text-[#2791B5]">
                  Add Method
                </Text>
              </Pressable>
            </View>
            
            {paymentMethods.map((method) => (
              <PaymentMethodCard key={method.id} method={method} />
            ))}
          </View>

          {/* Recent Transactions */}
          <View className="mt-6 mb-8">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[20px] font-bold text-[#0C212C]">
                Recent Transactions
              </Text>
              <Pressable>
                <Text className="text-[14px] font-semibold text-[#2791B5]">
                  View All
                </Text>
              </Pressable>
            </View>
            
            {recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

function PaymentActionButton({
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
      className="h-24 w-[30%] items-center justify-center rounded-lg bg-white"
      style={{
        shadowColor: "rgb(168, 175, 182)",
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
      }}
      onPress={onPress}
    >
      <LinearGradient
        colors={["#2791B5", "#2B6173"]}
        className="h-10 w-10 items-center justify-center rounded-full"
      >
        <Ionicons name={icon} size={20} color="white" />
      </LinearGradient>
      <Text className="mt-2 text-[12px] font-semibold text-[#0C212C]">
        {title}
      </Text>
      <Text className="text-[10px] font-medium text-neutral-600">
        {subtitle}
      </Text>
    </Pressable>
  )
}

function PaymentMethodCard({ method }: { method: PaymentMethod }) {
  return (
    <Pressable
      className="mb-3 h-16 w-full flex-row items-center rounded-lg border-[1px] border-[#EAEAEA] bg-white px-4"
      style={{
        shadowColor: "rgb(168, 175, 182)",
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
      }}
      onPress={() => {}}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-100">
        <Ionicons 
          name={method.type === "card" ? "card" : "business"} 
          size={20} 
          color="#2791B5" 
        />
      </View>
      
      <View className="ml-3 flex-1">
        <Text className="text-[14px] font-semibold text-[#0C212C]">
          {method.bankName}
        </Text>
        <Text className="text-[12px] font-medium text-neutral-600">
          ****{method.lastFour}
        </Text>
      </View>
      
      {method.isDefault && (
        <View className="rounded-full bg-primary-500 px-2 py-1">
          <Text className="text-[10px] font-semibold text-white">
            Default
          </Text>
        </View>
      )}
      
      <Ionicons name="chevron-forward" size={16} color="#94A5AB" />
    </Pressable>
  )
}


function TransactionItem({ transaction }: { transaction: Transaction }) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "sent":
        return "arrow-up"
      case "received":
        return "arrow-down"
      case "bill":
        return "receipt"
      default:
        return "swap-horizontal"
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "sent":
        return "#EF4444"
      case "received":
        return "#10B981"
      case "bill":
        return "#F59E0B"
      default:
        return "#6B7280"
    }
  }

  return (
    <View className="mb-3 h-16 w-full flex-row items-center rounded-lg border-[1px] border-[#EAEAEA] bg-white px-4">
      <View 
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: getTransactionColor(transaction.type) + "20" }}
      >
        <Ionicons 
          name={getTransactionIcon(transaction.type) as keyof typeof Ionicons.glyphMap} 
          size={18} 
          color={getTransactionColor(transaction.type)} 
        />
      </View>
      
      <View className="ml-3 flex-1">
        <Text className="text-[14px] font-semibold text-[#0C212C]">
          {transaction.recipient}
        </Text>
        <Text className="text-[12px] font-medium text-neutral-600">
          {transaction.date}
        </Text>
      </View>
      
      <View className="items-end">
        <Text 
          className="text-[14px] font-bold"
          style={{ 
            color: transaction.type === "sent" ? "#EF4444" : "#10B981" 
          }}
        >
          {transaction.type === "sent" ? "-" : "+"}{transaction.amount}
        </Text>
        <Text className="text-[10px] font-medium text-neutral-600">
          {transaction.status}
        </Text>
      </View>
    </View>
  )
}
