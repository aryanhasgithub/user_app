import { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  
  // Load chats from AsyncStorage on mount
  useEffect(() => {
    loadChats();
  }, []);
  
  async function loadChats() {
    try {
      const stored = await AsyncStorage.getItem('chats');
      if (stored) {
        setChats(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }
  
  async function saveChats(newChats) {
    try {
      await AsyncStorage.setItem('chats', JSON.stringify(newChats));
      setChats(newChats);
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  }
  
  async function createNewChat(id) {
    console.log("createNewChat called with id:", id);
    
    const newChat = {
      id: id,
      messages: [],
      createdAt: new Date().toISOString(),
      status: 'active',
      completed: false,
    };
    
    const updated = [newChat, ...chats];
    await saveChats(updated);
    
    // Return a promise that resolves after state is updated
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(newChat.id);
      }, 50);
    });
  }
  
  async function deleteChat(chatId) {
    const updated = chats.filter(chat => chat.id !== chatId);
    await saveChats(updated);
  }
  
  async function markChatCompleted(chatId) {
    const updated = chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, completed: true, status: 'completed' } 
        : chat
    );
    await saveChats(updated);
  }
  
  async function saveCompletedChat(chatId, messages) {
    const updated = chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, messages, completed: true, status: 'completed' } 
        : chat
    );
    await saveChats(updated);
  }
  
  async function clearAllChats() {
    try {
      await AsyncStorage.removeItem('chats');
      setChats([]);
    } catch (e) {
      console.error('Error clearing chats:', e);
    }
  }
  
  return (
    <ChatContext.Provider value={{ 
      chats, 
      createNewChat, 
      deleteChat,
      loadChats,
      clearAllChats,
      markChatCompleted,
      saveCompletedChat
    }}>
      {children}
    </ChatContext.Provider>
  );
}