import React from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Text, useColorScheme, Vibration } from 'react-native';
import uuid from 'react-native-uuid';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Custom Hooks & Constants
import { useChat } from '../../hooks/useChats';
import { Colors } from "../../constants/Colors";

// Themed Components
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButtonGreen from '../../components/ThemedButtonGreen';

const Chats = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const { chats, createNewChat, deleteChat } = useChat();

  const welcomeText = 'Welcome to MediTriage!\n\nPlease describe your symptoms in detail. Our AI will analyze them and connect you with the right specialist.';

  function openChat(id) {
    router.push(`/chat/${id}`);
  }

  async function newChat(id) {
    await createNewChat(id);
    // Small delay to ensure state updates propagate
    setTimeout(() => {
      router.push(`/chat/${id}`);
    }, 100);
  }

  // --- FILTERED CHAT TITLE LOGIC ---
  const getChatTitle = (chat) => {
    if (!chat.messages || chat.messages.length === 0) return 'New Consultation';

    // Search from oldest to newest to find the patient's first input
    const patientFirstMessage = [...chat.messages].reverse().find(m => 
      m.text !== welcomeText && 
      m.user._id !== 'system' && 
      m.user._id !== 'ml'
    );

    if (!patientFirstMessage) return 'New Consultation';

    const text = patientFirstMessage.text;
    return text.length > 30 ? text.substring(0, 30) + '...' : text;
  };

  return (
    <ThemedView safe={true} style={styles.container}>
      <ThemedText Title style={styles.title}>Chats</ThemedText>
      
      <View style={[styles.line, { backgroundColor: theme.uiBackground }]} />

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }} // Space for floating button
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => {
              Vibration.vibrate(100);
              deleteChat(item.id);
            }}
            delayLongPress={800} // Slightly faster than 1s for better UX
            onPress={() => openChat(item.id)}
          >
            <View style={[styles.messageBox, { borderColor: theme.uiBackground }]}>
              
              {/* Profile Icon Circle */}
              <View style={[styles.iconCircle, { borderColor: theme.uiBackground, backgroundColor: theme.navBackground }]}>
                <Ionicons 
                  size={30} 
                  name={item.completed ? 'checkmark-circle' : 'person'} 
                  color={item.completed ? '#10b981' : Colors.warning} 
                />
              </View>

              {/* Chat Info */}
              <View style={styles.infoContainer}>
                <View style={styles.titleRow}>
                  <ThemedText style={styles.chatTitle}>{getChatTitle(item)}</ThemedText>
                  
                  {/* COMPLETED BADGE */}
                  {item.completed && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>SAVED</Text>
                    </View>
                  )}
                </View>

                <ThemedText style={[styles.dateText, { color: theme.iconColor }]}>
                  {new Date(item.createdAt).toLocaleString([], {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </ThemedText>
              </View>

            </View>
          </TouchableOpacity>
        )}
      />

      {/* Floating Action Button */}
      <ThemedButtonGreen style={styles.button} onPress={() => newChat(uuid.v4())}>
        <Text style={styles.plus}>+</Text>
      </ThemedButtonGreen>
    </ThemedView>
  );
};

export default Chats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginLeft: 15,
    marginVertical: 10,
  },
  line: {
    height: 1,
    width: '100%',
    marginBottom: 10,
  },
  messageBox: {
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    height: 85,
    marginHorizontal: 12,
    marginVertical: 6,
    paddingHorizontal: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
    height: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#10b98120',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  badgeText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 11,
    marginTop: 4,
  },
  button: {
    position: "absolute",
    width: 90,
    height: 90,
    bottom: 30,
    right: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    zIndex: 100,
  },
  plus: {
    color: "#F4A259",
    fontSize: 60,
    position: "absolute"
  },
});