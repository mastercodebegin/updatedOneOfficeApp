import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS } from '../utilies/GlobalColors'
import { Fonts } from '../assets/fonts/GlobalFonts'
import { scaledSize } from '../utilies/Utilities'

interface S {
  name: string,
  onPress: any,
  buttonStyle?: {},
  textStyle?: {},
  backGroundColor?: string


}
export default function CustomeButton(props: S) {
  const { backGroundColor,buttonStyle,textStyle } = props
// console.log('backGroundColor',backGroundColor);

  return (
    // <Button mode="contained" onPress={props.onPress} color='gray' 
    // style={{borderColor:COLORS.THEME_COLOR,}} 
    // labelStyle={{color:'black'}}>
    //   {props.name}
    // </Button>
    <TouchableOpacity onPress={props.onPress}
      style={{
        flex: 1, 
        justifyContent: 'center', alignItems: 'center', borderRadius: 4,
        ...buttonStyle
      }}>

      <Text style={{
        letterSpacing: 1,
        fontFamily:  Fonts.regular,
        ...textStyle
      }}>{props.name}</Text>
    </TouchableOpacity>

  )
}
const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: scaledSize(8),

  },
  buttonName: {
    fontSize: scaledSize(17),
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1


  }

})