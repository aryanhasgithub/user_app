import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Platform,
  useColorScheme,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Modal,
  BackHandler
} from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Send, Composer } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { io } from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons';

// Custom Hooks & Constants
import { useUser } from '../../../hooks/useUser';
import { useMedInfo } from '../../../hooks/useMedInfo';
import { useChat } from '../../../hooks/useChats';
import { Colors } from '../../../constants/Colors';
import ThemedView from '../../../components/ThemedView';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useUser();
  const { info } = useMedInfo();
  const { chats, saveCompletedChat } = useChat();

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  // State Management
  const currentChatData = useMemo(() => chats.find(c => c.id === id), [chats, id]);

  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [chatStatus, setChatStatus] = useState('waiting');
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [showUrgencyEdit, setShowUrgencyEdit] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isTyping, setIsTyping] = useState(false);
  const [showBackPopup, setShowBackPopup] = useState(false);

  const socketRef = useRef(null);

  // Computed value - check if chat is completed
  const isAlreadyCompleted = currentChatData?.completed === true;

  // Layout Constants
  const tabbarHeight = 50;
  const keyboardTopToolbarHeight = Platform.select({ ios: 44, default: 0 });
  const keyboardVerticalOffset = insets.bottom + tabbarHeight + keyboardTopToolbarHeight;

  // --- NAVIGATION GUARDS ---
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Only prevent navigation if chat is NOT completed
      if (chatStatus !== 'completed' && !isAlreadyCompleted) {
        e.preventDefault();
        setShowBackPopup(true);
      }
    });

    const backAction = () => {
      if (chatStatus !== 'completed' && !isAlreadyCompleted) {
        setShowBackPopup(true);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => {
      unsubscribe();
      backHandler.remove();
    };
  }, [navigation, chatStatus, isAlreadyCompleted]);

  const confirmLeaveAndSave = async () => {
    setShowBackPopup(false);
    if (socketRef.current?.connected) {
      socketRef.current.emit('patient_end_chat', { chatId: id });
    }
    await saveCompletedChat(id, messages);
    setChatStatus('completed');
    router.back();
  };

  // --- MESSAGE INITIALIZATION ---
  useEffect(() => {
    // Reset chat status when chat data changes
    if (currentChatData) {
      if (currentChatData.completed) {
        setChatStatus('completed');
        setConnectionStatus('disconnected');
      } else {
        setChatStatus('waiting');
        setConnectionStatus('connecting');
      }

      if (currentChatData.messages && currentChatData.messages.length > 0) {
        setMessages(currentChatData.messages);
      } else {
        setMessages([{
          _id: 'welcome',
          text: 'Welcome to MediTriage!\n\nPlease describe your symptoms in detail. Our AI will analyze them and connect you with the right specialist.',
          createdAt: new Date(),
          user: { _id: 'system', name: 'MediTriage Bot' },
        }]);
      }
    }
  }, [currentChatData]);

  // --- SOCKET SETUP & EVENT LISTENERS ---
  useEffect(() => {
    // Don't connect socket if chat is already completed
    if (isAlreadyCompleted || chatStatus === 'completed') {
      setConnectionStatus('disconnected');
      return;
    }

    const newSocket = io('http://192.168.29.75:5000', {
      transports: ['polling', 'websocket'],
      reconnection: true,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      if (chatStatus !== 'completed') {
        setConnectionStatus('connected');
      }
    });

    newSocket.on('ml_analysis', (data) => {
      setCurrentAnalysis(data);
      setIsTyping(false);
      let analysisText = `AI Analysis Complete\n\nUrgency Level: ${data.urgency.toUpperCase()}\nRecommended Specialist: ${data.specialist_required}`;
      
      if (data.low_confidence) {
        analysisText += '\n\nOur AI has low confidence in this assessment.';
        setShowUrgencyEdit(true);
      }

      setMessages(prev => GiftedChat.append(prev, [{
        _id: `analysis-${Date.now()}`,
        text: analysisText,
        createdAt: new Date(),
        user: { _id: 'ml', name: 'AI Assistant' },
        analysisData: data,
      }]));
    });

    newSocket.on('doctor_message_to_patient', (data) => {
      setIsTyping(false);
      setMessages(prev => GiftedChat.append(prev, [{
        _id: `doctor-${Date.now()}`,
        text: data.message,
        createdAt: new Date(),
        user: { _id: 'doctor', name: data.doctorName || 'Doctor' },
      }]));
      setChatStatus('active');
    });

    newSocket.on('doctor_ended_chat', (data) => {
      setMessages(prev => GiftedChat.append(prev, [{
        _id: `system-${Date.now()}`,
        text: data.message || 'The doctor has ended the consultation.',
        createdAt: new Date(),
        user: { _id: 'system', name: 'System' },
      }]));
      confirmLeaveAndSave();
      setChatStatus('completed');
      
    });

    setSocket(newSocket);
    
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [id, isAlreadyCompleted, chatStatus]);

  // --- ACTIONS ---
  const onSend = useCallback((newMessages = []) => {
    if (!socket?.connected || chatStatus === 'completed' || isAlreadyCompleted) return;

    const message = newMessages[0];
    const isFirstUserMessage = messages.length <= 1;
    setMessages(prev => GiftedChat.append(prev, newMessages));

    const payload = {
      message: message.text,
      patient_id: socket.id,
      chatId: id,
      patientInfo: {
        age: info?.age || 'Not provided',
        gender: info?.gender || 'Not provided',
        medicalHistory: info?.medicalHistory || 'None',
      }
    };

    if (isFirstUserMessage) {
      setIsTyping(true);
      socket.emit('patient_message', { ...payload, AiNeeded: true });
    } else {
      socket.emit('patient_chat_message', payload);
    }
    setChatStatus('waiting');
  }, [socket, id, info, messages, chatStatus, isAlreadyCompleted]);

  const adjustUrgency = useCallback((newUrgency) => {
    if (!socket?.connected || !currentAnalysis || chatStatus === 'completed' || isAlreadyCompleted) return;

    socket.emit('adjust_urgency', {
      chatId: id,
      patient_id: socket.id,
      urgency: newUrgency,
      specialist_required: currentAnalysis.specialist_required,
    });

    setMessages(prev => GiftedChat.append(prev, [{
      _id: `adjust-${Date.now()}`,
      text: `Urgency level adjusted to: ${newUrgency.toUpperCase()}`,
      createdAt: new Date(),
      user: { _id: 'system', name: 'System' },
    }]));
    setShowUrgencyEdit(false);
  }, [socket, id, currentAnalysis, chatStatus, isAlreadyCompleted]);

  const handleEndChat = useCallback(async () => {
    if (socket?.connected) {
      socket.emit('patient_end_chat', { chatId: id });
    }
    await saveCompletedChat(id, messages);
    setChatStatus('completed');
    setConnectionStatus('disconnected');
    router.back();
  }, [socket, id, messages, saveCompletedChat, router]);

  // --- RENDER HELPERS ---
  const renderBubble = (props) => {
    const isDoctor = props.currentMessage.user._id === 'doctor';
    const isMl = props.currentMessage.user._id === 'ml';
    const isUser = props.currentMessage.user._id === (user?.$id || 1);
    
    let bubbleColor = theme.primary;
    if (isDoctor) bubbleColor = '#8B5CF6';
    else if (isMl) bubbleColor = '#3B82F6';
    else if (props.currentMessage.user._id === 'system') bubbleColor = '#475569';

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: { backgroundColor: isUser ? theme.primary : bubbleColor, borderRadius: 16, marginVertical: 4, padding: 2 },
          left: { backgroundColor: bubbleColor, borderRadius: 16, marginVertical: 4, padding: 2 },
        }}
        textStyle={{ right: { color: '#fff' }, left: { color: '#fff' } }}
      />
    );
  };

  const renderInputToolbar = (props) => {
    if (chatStatus === 'completed' || isAlreadyCompleted) {
      return (
        <View style={[styles.completedBanner, { backgroundColor: theme.uiBackground }]}>
          <Ionicons name="lock-closed" size={18} color={theme.iconColor} />
          <Text style={[styles.completedBannerText, { color: theme.text }]}>
            This consultation is closed.
          </Text>
        </View>
      );
    }
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: theme.background,
          borderTopColor: theme.uiBackground,
          borderTopWidth: 1,
          paddingVertical: 8,
          paddingHorizontal: 12,
        }}
      />
    );
  };

  const renderComposer = (props) => (
    <Composer
      {...props}
      textInputStyle={{
        backgroundColor: theme.uiBackground,
        color: theme.text,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        marginLeft: 0,
      }}
      placeholderTextColor={theme.iconColor}
    />
  );

  const renderSend = (props) => (
    <Send {...props} containerStyle={{ justifyContent: 'center', paddingHorizontal: 8 }}>
      <View style={[styles.sendButton, { backgroundColor: socket?.connected ? theme.primary : theme.iconColor }]}>
        <Ionicons name="send" size={18} color="#fff" />
      </View>
    </Send>
  );

  const renderFooter = () => (
    isTyping ? (
      <View style={styles.typingContainer}>
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={[styles.typingText, { color: theme.text }]}>AI is analyzing...</Text>
      </View>
    ) : null
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* Exit Modal */}
      <Modal visible={showBackPopup} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={[styles.modalIcon, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="exit-outline" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>End Session?</Text>
            <Text style={[styles.modalSubtitle, { color: theme.text }]}>
              Leaving now will save this chat and mark it as complete. You won't be able to send more messages.
            </Text>
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.uiBackground }]} onPress={() => setShowBackPopup(false)}>
                <Text style={[styles.modalBtnText, { color: theme.text }]}>Stay</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.primary }]} onPress={confirmLeaveAndSave}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Leave & Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header Status Bar */}
      <View style={[
        styles.statusBar,
        { backgroundColor: (chatStatus === 'completed' || isAlreadyCompleted) ? '#475569' : (connectionStatus === 'connected' ? '#10b981' : '#f59e0b') }
      ]}>
        <View style={styles.statusContent}>
          <Text style={styles.statusText}>
            {(chatStatus === 'completed' || isAlreadyCompleted) ? 'Completed Consultation' : (connectionStatus === 'connected' ? 'Connected' : 'Connecting...')}
          </Text>
          {chatStatus === 'active' && !isAlreadyCompleted && (
            <TouchableOpacity style={styles.endChatBtn} onPress={handleEndChat}>
              <Text style={styles.endChatBtnText}>End Chat</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: user?.$id || 1, name: info?.name || 'Patient' }}
        placeholder="Describe your symptoms..."
        alwaysShowSend
        showUserAvatar
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderComposer={renderComposer}
        renderSend={renderSend}
        renderFooter={renderFooter}
        inverted={true}
        keyboardAvoidingViewProps={{ keyboardVerticalOffset }}
      />

      {/* Urgency Adjustment UI */}
      {showUrgencyEdit && !isAlreadyCompleted && chatStatus !== 'completed' && (
        <View style={[styles.urgencyContainer, { backgroundColor: theme.background, borderTopColor: theme.uiBackground }]}>
          <Text style={[styles.urgencyTitle, { color: theme.text }]}>Adjust Urgency Level</Text>
          <View style={styles.urgencyButtons}>
            <TouchableOpacity style={[styles.urgencyBtn, styles.lowBtn]} onPress={() => adjustUrgency('low')}>
              <Text style={styles.urgencyBtnText}>Low</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.urgencyBtn, styles.mediumBtn]} onPress={() => adjustUrgency('medium')}>
              <Text style={styles.urgencyBtnText}>Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.urgencyBtn, styles.highBtn]} onPress={() => adjustUrgency('high')}>
              <Text style={styles.urgencyBtnText}>High</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowUrgencyEdit(false)}>
            <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBar: { paddingVertical: 8, paddingHorizontal: 16 },
  statusContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusText: { color: 'white', fontSize: 13, fontWeight: '600' },
  endChatBtn: { backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  endChatBtnText: { color: 'white', fontSize: 12, fontWeight: '600' },
  sendButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  typingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  typingText: { marginLeft: 8, fontSize: 13, fontStyle: 'italic', opacity: 0.7 },
  urgencyContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1, elevation: 8, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  urgencyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  urgencyButtons: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  urgencyBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  lowBtn: { backgroundColor: '#10b981' },
  mediumBtn: { backgroundColor: '#f59e0b' },
  highBtn: { backgroundColor: '#ef4444' },
  urgencyBtnText: { color: 'white', fontWeight: 'bold' },
  cancelBtn: { paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600' },
  completedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, margin: 10, borderRadius: 12, gap: 10 },
  completedBannerText: { fontSize: 13, fontWeight: '500', opacity: 0.8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 25 },
  modalContent: { borderRadius: 24, padding: 25, alignItems: 'center' },
  modalIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  modalSubtitle: { fontSize: 15, textAlign: 'center', marginBottom: 25, lineHeight: 22, opacity: 0.8 },
  modalActionRow: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
  modalBtnText: { fontWeight: '700', fontSize: 16 }
});