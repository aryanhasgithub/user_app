import { StyleSheet, Text, View,useColorScheme } from 'react-native'
import React from 'react'
import ThemedView from '../components/ThemedView'
import ThemedLogo from '../components/ThemedLogo'
import ThemedText from '../components/ThemedText'
import ThemedButton from '../components/ThemedButton'
import Spacer from '../components/Spacer'
import {Colors} from "../constants/Colors"
import {Link} from "expo-router"

const Splash = () => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light
  return (

    <ThemedView style={styles.container}>
        <ThemedLogo/>
        <Spacer height={20}/>
        <ThemedText  style={styles.title}>ML enhanced </ThemedText>
        <Spacer height={20}/>
        <Link style={[styles.link,{borderBottomColor:theme.text}]} href="/login"><ThemedText> Login Page</ThemedText></Link>
        <Spacer height={20}/>
        <Link style={[styles.link,{borderBottomColor:theme.text}]} href="/register"><ThemedText> Register Page</ThemedText></Link>
        



    </ThemedView>
    
  )
}

export default Splash

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