import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedInput from '../../components/ThemedInput'
import ThemedButton from '../../components/ThemedButton'
import Spacer from '../../components/Spacer'
import { StyleSheet,FlatList, View, TouchableOpacity} from 'react-native'
import uuid from 'react-native-uuid';
import { useChat } from '../../hooks/useChats'
import {Colors} from "../../constants/Colors"
import { Ionicons } from '@expo/vector-icons';

const Chats = () => {
  const { chats, createNewChat, deleteChat } = useChat
  function openChat(){
    console.log("hello")
  }
  const getChatTitle = (chat) => {
  if (chat.messages.length === 0) return 'New Consultation';
  // Get the LAST message (oldest, which is the patient's first symptom message)
  const firstMessage = chat.messages[chat.messages.length - 1];
  // Truncate if too long
  return firstMessage.text.length > 30 
    ? firstMessage.text.substring(0, 30) + '...' 
    : firstMessage.text;
   }  ;

  return (
   <ThemedView safe={true} style={styles.container}>
    <ThemedText Title>Chats</ThemedText>
    <View style={styles.line}></View>
    <FlatList
     data={chats}
     keyExtractor={(item) => item.id}
     renderItem={({ item }) => (
      <TouchableOpacity onPress={openChat}>
        <View style={[styles.messageBox,{borderColor:theme.uiBackground}]}>
          <ThemedText style={styles.chatTitle}>{getChatTitle(item)}</ThemedText>
          <View style={[styles.iconCircle,{borderColor:theme.uiBackground,backgroundColor:theme.navBackground}]}>
            <Ionicons 
                size={30} 
                name={'person'} 
                color={Colors.warning} 
              />
              <ThemedText style={[styles.dateText,{color:theme.iconColor}]}>Date:{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</ThemedText>

          </View>







      </TouchableOpacity>



     )}
    >

    </FlatList>
   </ThemedView>
  )
}

export default Chats

const styles = StyleSheet.create({
  container:{
    flex:1,
    alignItems: "stretch",
  },
messageBox: {
  borderRadius: 15,
  borderWidth: 2,
  position: 'relative',
  height: 75,
  marginLeft: 12,
  marginRight: 12,
  marginTop: 6,
  marginBottom: 6,
  
},
chatTitle: {
  fontSize: 16,
  position: "absolute",
  top: 4,
  left: 80,
  
},
iconCircle: {
    width: 65,
    position: "absolute",
    height: 65,
    borderRadius: 50,      // ← Half of width/height for perfect circle
    justifyContent: 'center',
    alignItems: 'center',
    top:3,
    left: 5,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center"
  },
  line: {
    height: 1,
    backgroundColor: '#979797ff',
    width: '100%',
    },
  dateText:{
  position: "absolute",
  left:220,
  top:40
}


  
})