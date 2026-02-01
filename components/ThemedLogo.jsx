import { Image,useColorScheme } from 'react-native'
import DarkLogo from '../assets/img/logo_dark.png'
import LightLogo from '../assets/img/logo_light.png'


const themedLogo = () => {
    const colorScheme = useColorScheme()
    const logo = colorScheme === 'dark' ? DarkLogo : LightLogo
  return (
    <Image source={logo} style={{height:300,width:300}} />

  )
}

export default themedLogo

