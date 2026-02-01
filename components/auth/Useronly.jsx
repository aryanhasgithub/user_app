import { useEffect } from 'react'
import { ActivityIndicator } from 'react-native'
import { useUser } from '../../hooks/useUser'
import { useRouter } from 'expo-router'
import ThemedView from '../ThemedView'


const UserOnly = ({ children }) => {
  const { user, authChecked } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (authChecked && !user) {
      router.replace('/(auth)/login')
    }
  }, [authChecked, user])

  if (!authChecked) {
    return (
      <ThemedView style={{width:"100%",height:"100%",justifyContent:"center",alignItems:"center"}}>

      </ThemedView>
    )
  }

  if (!user) {
    return null // redirect in progress
  }

  return children
}

export default UserOnly
