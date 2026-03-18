import { View, Text, ImageBackground, Image } from 'react-native'
import React from 'react'
import { scaledSize } from '../../utilies/Utilities'
import { Fonts } from '../../assets/fonts/GlobalFonts'
import { mediumBG, smallBG } from '../../assets/GlobalImages'
import HeaderComponent from '../../component/CustomHeader'

export default function ContactUs({navigation}) {
  return (
    <ImageBackground style={{flex:1,  backgroundColor:'white'}} 
    source={mediumBG} resizeMode='center' >
        <View style={{height:scaledSize(100)}}>
            <HeaderComponent title='Contact us' onPress={()=>navigation.goBack()}/>
        </View>
     
        <View style={{ flex:1,justifyContent:'center',alignItems:'flex-end',flexDirection:'row'}}>

      <Text style={{fontFamily:Fonts.bold,
      fontSize:scaledSize(16),bottom:scaledSize(60)}}>E-mail :  </Text>
      <Text style={{fontFamily:Fonts.regular,
      fontSize:scaledSize(16),bottom:scaledSize(60)}}> shopax77@gmail.com</Text>
                </View>
    </ImageBackground>
  )
}