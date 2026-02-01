import { TextInput,useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'


const themedInput = ({style,...props}) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    return (
      <TextInput style={[
          {color:theme.text,backgroundColor:theme.uiBackground,padding:20,borderRadius:6},style ]}
          {...props}/>

  )
}

export default themedInput

