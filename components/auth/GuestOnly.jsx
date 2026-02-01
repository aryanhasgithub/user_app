import { useUser } from '../../hooks/useUser'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { Text } from 'react-native'
import { StyleSheet, View,useColorScheme } from 'react-native'

import ThemedView from '../../components/ThemedView'
import ThemedLogo from '../../components/ThemedLogo'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import {router} from "expo-router"


const GuestOnly = ({ children }) => {
  const { user, authChecked } = useUser()
  const router = useRouter()
  
  useEffect(() => {
  if (authChecked && user !== null) {
    const timer = setTimeout(() => {
      router.replace("/chats")
    }, 2000) // 2 seconds

    return () => clearTimeout(timer)
  }
}, [user, authChecked])

  if (!authChecked || user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedLogo/>
        <Spacer height={20}/>
        <ThemedText  style={styles.title}>ML enhanced Doctor To Patient Service</ThemedText>
        <Spacer height={20}/>
        



    </ThemedView>
    )
  }

  return children
}
const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title:{
        fontSize: 18,
        fontWeight: 'bold'
    },
    link:{
    borderBottomWidth: 1
  }
})
export default GuestOnly
