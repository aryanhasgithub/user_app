import { createContext, useEffect, useState } from "react"
import { databases } from "../lib/appwrite"
import { Query, Permission, Role, ID } from "react-native-appwrite"
import { useUser } from "../hooks/useUser"

const DATABASE_ID = "6954c75e00364a1bedd4"
const COLLECTION_ID = "info"

export const MedInfoContext = createContext()

export function MedInfoProvider({ children }) {
  const [info, setInfo] = useState({
    userId: '',
    name: '',
    age: null,
    gender: '',
    height: null,
    medicalHistory: ''
  })
  
  const { user } = useUser()
  
  async function fetchInfo() {
    if (!user?.$id) {
      console.error('No user ID available');
      return null;
    }
    
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('userId', user.$id)
        ]
      )
      
      if (response.documents.length > 0) {
        setInfo(response.documents[0]);
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching info:', error);
      throw error;
    }
  }
  
  async function createInfo(name, age, gender, height, medicalHistory) {
    if (!user?.$id) {
      throw new Error('No user ID available');
    }
    
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          name,
          age,
          gender,
          height,
          medicalHistory
        }
        // Permissions are handled at collection level in Appwrite dashboard
      );
      setInfo(response);
      return response;
    } catch (error) {
      console.error('Error creating info:', error);
      throw error;
    }
  }
  
  async function updateInfo(updatedFields) {
    if (!user?.$id) {
      throw new Error('No user ID available');
    }
    
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        info.$id,
        updatedFields
      );
      setInfo(response);
      return response;
    } catch (error) {
      console.error('Error updating info:', error);
      throw error;
    }
  }
  
  async function checkIfInfoExists() {
    try {
      const response = await fetchInfo();
      return response?.documents?.length > 0;
    } catch {
      return false;
    }
  }
  
  useEffect(() => {
    if (user?.$id) {
      fetchInfo();
    }
  }, [user]);
  
  return (
    <MedInfoContext.Provider value={{ 
      info, 
      setInfo,
      fetchInfo, 
      createInfo,
      updateInfo,
      checkIfInfoExists
    }}>
      {children}
    </MedInfoContext.Provider>
  );
}