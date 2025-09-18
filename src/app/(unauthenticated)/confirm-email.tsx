import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { makeRedirectUri } from "expo-auth-session"
import { router, useLocalSearchParams } from "expo-router"
import { Alert, Image, Linking, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { supabase } from "@/supabase"
import { cn } from "@/utils/cn"

export default function Page() {
  const { email } = useLocalSearchParams()

  const handleResendEmail = async () => {
    if (!email) return
    
    console.log("🔄 Resending OTP email to:", email)
    
    try {
      const redirectURL = makeRedirectUri()
      const { error } = await supabase.auth.signInWithOtp({
        email: email as string,
        options: {
          emailRedirectTo: redirectURL,
        },
      })

      if (error) {
        console.error("❌ Resend error:", error)
        Alert.alert("Error", error.message, [{ text: "OK" }])
        return
      }

      console.log("✅ Email resent successfully!")
      Alert.alert("Email Sent", "A new confirmation email has been sent to your inbox.", [{ text: "OK" }])
    } catch (err) {
      console.error("💥 Resend network error:", err)
      Alert.alert("Network Error", "Failed to resend email. Please check your internet connection.", [{ text: "OK" }])
    }
  }

  return (
    <LinearGradient
      colors={["#265565", "#288FB1", "#265565"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 pb-7 pt-1">
          <View className="h-11 w-full justify-center">
            <Pressable
              className="absolute left-0 top-0 h-11 w-11 items-center justify-center"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
          </View>
          <View className="flex-1">
            <Image
              style={{ resizeMode: "cover" }}
              className="w-full flex-1"
              source={require("@/assets/planes.png")}
            />
          </View>
          <View className="px-4">
            <Text className="mt-1 text-center text-[34px] font-bold text-white">
              Confirm your email
            </Text>
            <Text className="mb-8 mt-2 text-center text-[13px] font-medium text-neutral-300">
              {`We just sent you an email to ${email}`}
            </Text>
            <Pressable
              className={cn(
                "mb-4 h-12 w-full items-center justify-center rounded-xl bg-[#E8F569]",
              )}
              // TODO: Replace with universal solution. https://github.com/includable/react-native-email-link
              onPress={() => Linking.openURL("googlegmail://")}
            >
              <Text className={cn("text-[16px] font-bold text-[#134555]")}>
                Open email app
              </Text>
            </Pressable>
            <Pressable
              className={cn(
                "h-12 w-full items-center justify-center rounded-xl bg-primary-600",
              )}
              onPress={handleResendEmail}
            >
              <Text className={cn("text-[16px] font-bold text-white")}>
                I didn't receive my email
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}
