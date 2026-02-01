import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedInput from '../../components/ThemedInput'
import ThemedButton from '../../components/ThemedButton'
import Spacer from '../../components/Spacer'
import { useEffect, useState } from 'react'
import { useMedInfo } from '../../hooks/useMedInfo'
import { useUser } from '../../hooks/useUser'
import { StyleSheet, ScrollView, View, Text,useColorScheme} from 'react-native'
import { Colors } from "../../constants/Colors";
const Profile = () => {
  const { user, logout } = useUser()
  const { info, updateInfo, createInfo, fetchInfo, checkIfInfoExists } = useMedInfo()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [medicalHistory, setMedicalHistory] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch info when user is available
  useEffect(() => {
    if (user) {
      fetchInfo()
    }
  }, [user])

  // Prefill all fields when info is loaded
  useEffect(() => {
    if (info) {
      setName(info.name || '')
      setAge(info.age?.toString() || '')
      setGender(info.gender || '')
      setHeight(info.height?.toString() || '')
      setWeight(info.weight?.toString() || '')
      setMedicalHistory(info.medicalHistory || '')
    }
  }, [info])

  const handleSave = async () => {
    setLoading(true)
    try {
      const updatedData = {
        name,
        age: parseInt(age) || 0,
        gender,
        height: parseFloat(height) || 0.0,
        weight: parseFloat(weight) || 0.0,
        medicalHistory
      }
      
      const exists = await checkIfInfoExists()
      
      if (exists) {
        await updateInfo(updatedData)
      } else {
        await createInfo(
          name, 
          parseInt(age) || 0, 
          gender, 
          parseFloat(height) || 0.0, 
          parseFloat(weight) || 0.0,
          medicalHistory
        )
      }
      
      alert('Profile saved successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile')
    } finally {
      setLoading(false)
    }
  }
 const colorScheme = useColorScheme();
 const theme = Colors[colorScheme] ?? Colors.light;
  return (
    <ThemedView safe={true} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText  style={styles.heading}>My Profile</ThemedText>
          <View style={[styles.line, { backgroundColor: theme.uiBackground }]} />
          
          <Spacer height={8}/>
          <ThemedText style={styles.emailText}>{user?.email}</ThemedText>
        </View>

        <Spacer height={32}/>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
          <Spacer height={16}/>
          
          <ThemedInput 
            styles={styles.input} 
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          <Spacer height={12}/>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <ThemedInput 
                styles={styles.input} 
                placeholder="Age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
            <Spacer width={12}/>
            <View style={styles.halfWidth}>
              <ThemedInput 
                styles={styles.input} 
                placeholder="Gender"
                value={gender}
                onChangeText={setGender}
              />
            </View>
          </View>
          <Spacer height={12}/>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <ThemedInput 
                styles={styles.input} 
                placeholder="Height (cm)"
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
              />
            </View>
            <Spacer width={12}/>
            <View style={styles.halfWidth}>
              <ThemedInput 
                styles={styles.input} 
                placeholder="Weight (kg)"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        <Spacer height={24}/>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Medical History</ThemedText>
          <Spacer height={16}/>
          
          <ThemedInput 
            styles={styles.multiline} 
            placeholder="Enter any relevant medical history, allergies, conditions, or medications..."
            value={medicalHistory}
            onChangeText={setMedicalHistory}
            multiline
          />
        </View>

        <Spacer height={32}/>

        <ThemedButton 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Save Profile'}
          </Text>
        </ThemedButton>
        <ThemedButton onPress={logout}>
          <Text>Logout</Text>
        </ThemedButton>
        <Spacer height={40}/>
      </ScrollView>
    </ThemedView>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'flex-start',
  },
  heading: {
    fontWeight: "bold",
    fontSize: 28,
  },
  emailText: {
    fontSize: 14,
    opacity: 0.6,
  },
  section: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  line: {
    height: 1,
    width: '100%',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  halfWidth: {
    flex: 1,
  },
  multiline: {
    padding: 16,
    borderRadius: 12,
    minHeight: 120,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})