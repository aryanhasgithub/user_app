import { StyleSheet, Text, View, useColorScheme} from 'react-native'
import {Stack} from "expo-router"
import { StatusBar } from 'expo-status-bar'
import { Colors } from "../constants/Colors"
import { UserProvider } from "../contexts/UserContext"
import { MedInfoProvider } from '../contexts/MedInfoContext'
import { ChatProvider } from '../contexts/ChatContext'
import GuestOnly from '../components/auth/GuestOnly'

const RootLayout = () => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light
  
  return (
    <UserProvider>
      <MedInfoProvider>
        <ChatProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.navBackground },
            headerTintColor: theme.title,
            headerShown: false,
          }}>
          <StatusBar style="auto"/>
          <GuestOnly>
          <Stack.Screen name="index" options={{headerShown:false}}/>
          </GuestOnly>
          <Stack.Screen name="(auth)" options={{headerShown:false}}/>
          <Stack.Screen name="(tabs)" options={{headerShown:false}}/>
        </Stack>
        </ChatProvider>
      </MedInfoProvider>
    </UserProvider>
  )
}

export default RootLayout