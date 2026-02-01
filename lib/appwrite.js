import { Client, Account, Avatars,Databases} from 'react-native-appwrite';
export const client = new Client()
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject('6954c0f7003a4ca22367')   // Your Project ID
  .setPlatform('com.arysharp.user');   // Your package name / bundle identifier
export const account = new Account(client)
export const databases = new Databases(client)
export const avatars = new Avatars(client)