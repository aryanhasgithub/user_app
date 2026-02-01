import  { Stack } from "expo-router"
import { StatusBar } from "react-native"
import { Colors } from "../../constants/Colors"
import { useColorScheme } from "react-native"
import { useUser } from "../../hooks/useUser"
import UserOnly from "../../components/auth/Useronly"
import GuestOnly from "../../components/auth/GuestOnly"


export default function AuthLayout() {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

  return (
    
    <GuestOnly>
      <Stack 
        screenOptions={{ headerShown: true, animation: "none",headerStyle: { backgroundColor: theme.navBackground },
          headerTintColor: theme.title}} >
        <StatusBar style="auto" />
        <Stack.Screen name="login" options={{title:"Login"}}/>
        <Stack.Screen name="register" options={{title:"Register"}}/>
        </Stack>
    </GuestOnly>
    
  )
}