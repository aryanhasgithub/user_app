// app/(tabs)/_layout.jsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from "../../constants/Colors";
import UserOnly from '../../components/auth/Useronly';


export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <UserOnly>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { 
            backgroundColor: theme.navBackground, 
            paddingTop: 10, 
            height: 90 
          },
          tabBarActiveTintColor: theme.iconColorFocused,
          tabBarInactiveTintColor: theme.iconColor,
        }}
      >
        <Tabs.Screen 
          name="chats"
          options={{ 
            title: "Chats", 
            tabBarIcon: ({ focused, color }) => (
              <Ionicons 
                size={24} 
                name={focused ? 'chatbubbles' : 'chatbubbles-outline'} 
                color={color} 
              />
            )
          }} 
        />
        
        <Tabs.Screen 
          name="profile"
          options={{ 
            title: "Profile", 
            tabBarIcon: ({ focused, color }) => (
              <Ionicons 
                size={24} 
                name={focused ? 'person' : 'person-outline'} 
                color={color} 
              />
            )
          }}
        />

        {/* --- HIDDEN TAB BAR FOR CHAT SCREEN --- */}
        <Tabs.Screen 
          name="chat/[id]"
          options={{ 
            href: null,
            tabBarStyle: { display: 'none' } // This hides the bar when the screen is active
          }}
        />
      </Tabs>
    </UserOnly>
  );
}